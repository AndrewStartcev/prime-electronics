[CmdletBinding()]
param(
    [string]$DumpPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$ComposeFile = Join-Path $Root "docker-compose.dev.yml"
$DevDataDir = Join-Path $Root "dev-data"
$BackendDir = Join-Path $Root "ecommerce-backend"
$FrontendDir = Join-Path $Root "e-commerce"
$AdminDir = Join-Path $Root "e-commerce-admin"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Require-Command([string]$Name, [string]$Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Fail "$Name not found. $Hint"
    }
}

function Invoke-Native([string]$File, [string[]]$Arguments) {
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed ($LASTEXITCODE): $File $($Arguments -join ' ')"
    }
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

function Test-NodeVersion {
    $raw = (& node --version).Trim().TrimStart('v')
    try {
        $v = [version]$raw
    } catch {
        Fail "Cannot parse Node.js version: $raw"
    }

    $supported =
        ($v.Major -ge 24) -or
        ($v.Major -eq 22 -and $v.Minor -ge 12) -or
        ($v.Major -eq 20 -and $v.Minor -ge 19)

    if (-not $supported) {
        Fail "Node.js $raw is too old for Prisma 7 / Next 16. Install Node 22.12+ (recommended: current Node 22 LTS)."
    }

    Write-Host "Node.js: v$raw" -ForegroundColor Green
}

function Test-DockerVolume([string]$Name) {
    & docker volume inspect $Name *> $null
    return ($LASTEXITCODE -eq 0)
}

function Find-DatabaseDump {
    if ($DumpPath) {
        if (-not (Test-Path -LiteralPath $DumpPath -PathType Leaf)) {
            Fail "Database dump not found: $DumpPath"
        }
        return (Resolve-Path -LiteralPath $DumpPath).Path
    }

    $inDevData = @(
        Get-ChildItem -LiteralPath $DevDataDir -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match '\.sql(\.gz)?$' }
    )

    if ($inDevData.Count -gt 1) {
        Fail "More than one SQL dump found in dev-data. Leave only one .sql or .sql.gz file there."
    }
    if ($inDevData.Count -eq 1) {
        return $inDevData[0].FullName
    }

    $searchDirs = @(
        $Root,
        (Join-Path $HOME "Downloads"),
        (Join-Path $HOME "Desktop")
    ) | Select-Object -Unique

    foreach ($dir in $searchDirs) {
        if (-not (Test-Path -LiteralPath $dir -PathType Container)) {
            continue
        }

        $match = Get-ChildItem -LiteralPath $dir -File -Filter "prime-production-*.sql.gz" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($match) {
            return $match.FullName
        }
    }

    return $null
}

function Prepare-DatabaseDump {
    $volumeExists = Test-DockerVolume "prime-local-postgres-data"
    $dump = Find-DatabaseDump

    if (-not $dump) {
        if ($volumeExists) {
            Write-Host "PostgreSQL volume already exists; dump import is not required." -ForegroundColor DarkGray
            return
        }

        Fail @"
Production dump was not found automatically.
Put prime-production-*.sql.gz into:
  $DevDataDir
and run dev.cmd again.
"@
    }

    $dumpParent = [System.IO.Path]::GetFullPath((Split-Path -Parent $dump)).TrimEnd('\')
    $devDataFull = [System.IO.Path]::GetFullPath($DevDataDir).TrimEnd('\')

    if (-not $dumpParent.Equals($devDataFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $extension = if ($dump.EndsWith(".sql.gz", [System.StringComparison]::OrdinalIgnoreCase)) { ".sql.gz" } else { ".sql" }
        $target = Join-Path $DevDataDir ("00-production" + $extension)
        Copy-Item -LiteralPath $dump -Destination $target -Force
        $dump = $target
        Write-Host "Database dump copied to dev-data: $(Split-Path -Leaf $dump)" -ForegroundColor Green
    } else {
        Write-Host "Database dump: $(Split-Path -Leaf $dump)" -ForegroundColor Green
    }

    if ($volumeExists) {
        Write-Host "PostgreSQL volume already exists; dump will not be re-imported." -ForegroundColor DarkGray
    } else {
        Write-Host "Dump will be imported automatically on first PostgreSQL start." -ForegroundColor Green
    }
}

function Write-LocalEnvs {
    $backendEnv = @'
NODE_ENV=development
PORT=6001
DATABASE_URL=postgresql://prime:prime_local@127.0.0.1:55432/prime_local?schema=public
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

JWT_ACCESS_SECRET=prime-local-access-secret-do-not-use-in-production
JWT_REFRESH_SECRET=prime-local-refresh-secret-do-not-use-in-production
JWT_ACCESS_EXPIRES_SECONDS=900
JWT_REFRESH_EXPIRES_SECONDS=604800

REDIS_HOST=127.0.0.1
REDIS_PORT=56379
REDIS_PASSWORD=prime_local_redis
REDIS_URL=redis://:prime_local_redis@127.0.0.1:56379

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_WATERMARK_PUBLIC_ID=ecommerce/watermarks/prime-logo

TELEGRAM_BOT_TOKEN=

SMSRU_API_ID=local-development-disabled
SMSRU_FROM=
SMSRU_TEST_MODE=true

AMOCRM_API_BASE_URL=
AMOCRM_BASE_DOMAIN=
AMOCRM_LONG_LIVED_TOKEN=
AMOCRM_RESPONSIBLE_USER_ID=
AMOCRM_PIPELINE_ID=
AMOCRM_STATUS_ID=
AMOCRM_CANCELLED_STATUS_ID=
'@

    $frontendEnv = @'
NEXT_PUBLIC_API_URL=http://localhost:6001/api
'@

    $adminEnv = @'
NEXT_PUBLIC_API_URL=http://localhost:6001/api
'@

    Write-Utf8NoBom (Join-Path $BackendDir ".env") ($backendEnv.Trim() + [Environment]::NewLine)
    Write-Utf8NoBom (Join-Path $FrontendDir ".env.local") ($frontendEnv.Trim() + [Environment]::NewLine)
    Write-Utf8NoBom (Join-Path $AdminDir ".env.local") ($adminEnv.Trim() + [Environment]::NewLine)

    Write-Host "Local .env files created. External write integrations are disabled." -ForegroundColor Green
}

function Wait-ForPostgres {
    Write-Host "Waiting for PostgreSQL (first dump import may take a little longer)..." -ForegroundColor DarkGray
    for ($i = 0; $i -lt 120; $i++) {
        & docker exec prime-local-postgres pg_isready -U prime -d prime_local *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PostgreSQL is ready." -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 2
    }
    Fail "PostgreSQL did not become ready. Run: docker logs prime-local-postgres"
}

function Wait-ForRedis {
    Write-Host "Waiting for Redis..." -ForegroundColor DarkGray
    for ($i = 0; $i -lt 30; $i++) {
        $result = & docker exec prime-local-redis redis-cli -a prime_local_redis ping 2>$null
        if ($LASTEXITCODE -eq 0 -and ($result -join "").Trim() -eq "PONG") {
            Write-Host "Redis is ready." -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 1
    }
    Fail "Redis did not become ready. Run: docker logs prime-local-redis"
}

function Install-Project([string]$Name, [string]$Directory) {
    $nodeModules = Join-Path $Directory "node_modules"
    $integrity = Join-Path $nodeModules ".yarn-integrity"
    $lockFile = Join-Path $Directory "yarn.lock"

    $needsInstall = -not (Test-Path -LiteralPath $nodeModules -PathType Container)
    if (-not $needsInstall -and -not (Test-Path -LiteralPath $integrity -PathType Leaf)) {
        $needsInstall = $true
    }
    if (-not $needsInstall -and (Test-Path -LiteralPath $lockFile -PathType Leaf)) {
        $needsInstall = (Get-Item -LiteralPath $lockFile).LastWriteTimeUtc -gt (Get-Item -LiteralPath $integrity).LastWriteTimeUtc
    }

    if (-not $needsInstall) {
        Write-Host "$Name dependencies are up to date." -ForegroundColor DarkGray
        return
    }

    Write-Step "Installing $Name dependencies"
    Push-Location $Directory
    try {
        Invoke-Native "npx" @("--yes", "yarn@1.22.22", "install", "--frozen-lockfile")
    } finally {
        Pop-Location
    }
}

Write-Step "Checking local development prerequisites"
Require-Command "docker" "Install Docker Desktop and start it."
Require-Command "node" "Install Node.js 22 LTS."
Require-Command "npm" "npm must be available together with Node.js."
Test-NodeVersion

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "Docker Desktop is installed but Docker Engine is not running. Start Docker Desktop and run dev.cmd again."
}
Write-Host "Docker Engine: ready" -ForegroundColor Green

if (-not (Test-Path -LiteralPath $ComposeFile -PathType Leaf)) {
    Fail "docker-compose.dev.yml not found in repository root."
}

New-Item -ItemType Directory -Path $DevDataDir -Force | Out-Null

Write-Step "Preparing safe local configuration"
Prepare-DatabaseDump
Write-LocalEnvs

Write-Step "Starting PostgreSQL and Redis"
Invoke-Native "docker" @("compose", "-f", $ComposeFile, "up", "-d", "postgres", "redis")
Wait-ForPostgres
Wait-ForRedis

Install-Project "backend" $BackendDir
Install-Project "frontend" $FrontendDir
Install-Project "admin" $AdminDir

Write-Step "Generating Prisma client"
Push-Location $BackendDir
try {
    Invoke-Native "npm" @("run", "prisma:generate")
} finally {
    Pop-Location
}

$runtimeDir = Join-Path $Root ".dev"
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
Write-Utf8NoBom (Join-Path $runtimeDir "setup-complete") ((Get-Date).ToString("o") + [Environment]::NewLine)

Write-Host ""
Write-Host "Local environment is ready." -ForegroundColor Green
Write-Host "Next runs only need: dev.cmd" -ForegroundColor Cyan
