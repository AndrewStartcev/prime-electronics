[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$ComposeFile = Join-Path $Root "docker-compose.dev.yml"
$SetupScript = Join-Path $Root "setup-dev.ps1"
$LocalAdminScript = Join-Path $Root "local-admin.js"
$BackendDir = Join-Path $Root "ecommerce-backend"
$FrontendDir = Join-Path $Root "e-commerce"
$AdminDir = Join-Path $Root "e-commerce-admin"
$BackendPort = 16001
$BackendUrl = "http://localhost:$BackendPort"
$ApiUrl = "$BackendUrl/api"
$LocalDatabaseUrl = "postgresql://prime:prime_local@127.0.0.1:55432/prime_local?schema=public"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Test-TcpPort([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        if (-not $async.AsyncWaitHandle.WaitOne(300)) {
            return $false
        }
        $client.EndConnect($async)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Stop-ProcessOnPort([int]$Port, [string]$Name) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        $pids = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
        foreach ($processId in $pids) {
            if ($processId -and $processId -ne $PID) {
                Write-Host "Restarting $Name (PID $processId) to load current code." -ForegroundColor Yellow
                & taskkill.exe /PID $processId /T /F 1>$null 2>$null
            }
        }
    } catch {
        Write-Host "Could not stop existing $Name automatically: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

function Wait-ForPort([int]$Port, [string]$Name, [int]$TimeoutSeconds = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-TcpPort $Port) {
            Write-Host "$Name is listening on port $Port." -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Test-PostgresReady {
    $oldPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & docker exec prime-local-postgres pg_isready -U prime -d prime_local 1>$null 2>$null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

function Wait-ForPostgres([int]$TimeoutSeconds = 120) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PostgresReady) {
            Write-Host "Local PostgreSQL is ready." -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Sync-LocalPrisma {
    Write-Step "Syncing Prisma client and local migrations"

    $previousDatabaseUrl = $env:DATABASE_URL
    $oldPreference = $ErrorActionPreference
    try {
        $env:DATABASE_URL = $LocalDatabaseUrl
        $ErrorActionPreference = "Continue"
        Push-Location $BackendDir

        & npm.cmd run prisma:generate
        if ($LASTEXITCODE -ne 0) {
            Fail "Prisma client generation failed."
        }

        & npx.cmd prisma migrate deploy --config=./prisma/prisma.config.ts
        if ($LASTEXITCODE -ne 0) {
            Fail "Local Prisma migrations failed. Production database was not touched."
        }
    } finally {
        Pop-Location
        $ErrorActionPreference = $oldPreference
        if ($null -eq $previousDatabaseUrl) {
            Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
        } else {
            $env:DATABASE_URL = $previousDatabaseUrl
        }
    }
}

function Needs-Setup {
    $requiredFiles = @(
        (Join-Path $BackendDir ".env"),
        (Join-Path $FrontendDir ".env.local"),
        (Join-Path $AdminDir ".env.local")
    )
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
            return $true
        }
    }

    $projects = @($BackendDir, $FrontendDir, $AdminDir)
    foreach ($project in $projects) {
        $nodeModules = Join-Path $project "node_modules"
        $integrity = Join-Path $nodeModules ".yarn-integrity"
        $lockFile = Join-Path $project "yarn.lock"

        if (-not (Test-Path -LiteralPath $nodeModules -PathType Container)) {
            return $true
        }
        if (-not (Test-Path -LiteralPath $integrity -PathType Leaf)) {
            return $true
        }
        if ((Test-Path -LiteralPath $lockFile -PathType Leaf) -and
            ((Get-Item -LiteralPath $lockFile).LastWriteTimeUtc -gt (Get-Item -LiteralPath $integrity).LastWriteTimeUtc)) {
            return $true
        }
    }

    return $false
}

if (Needs-Setup) {
    Write-Step "First local run: preparing the project"
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SetupScript
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Fail "Docker not found. Install/start Docker Desktop."
}

$oldPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = "Continue"
    & docker info 1>$null 2>$null
    $dockerReady = ($LASTEXITCODE -eq 0)
} finally {
    $ErrorActionPreference = $oldPreference
}
if (-not $dockerReady) {
    Fail "Docker Engine is not running. Start Docker Desktop and run dev.cmd again."
}

Write-Step "Starting PostgreSQL and Redis"
& docker compose -f $ComposeFile up -d postgres redis
if ($LASTEXITCODE -ne 0) {
    Fail "Docker services failed to start."
}

Write-Step "Waiting for local PostgreSQL"
if (-not (Wait-ForPostgres)) {
    Fail "Local PostgreSQL did not become ready within 120 seconds."
}

Sync-LocalPrisma

if (-not (Test-Path -LiteralPath $LocalAdminScript -PathType Leaf)) {
    Fail "local-admin.js not found in repository root. Run git pull and try again."
}

Write-Step "Preparing local admin account"
& node $LocalAdminScript
if ($LASTEXITCODE -ne 0) {
    Fail "Local admin account could not be prepared."
}

Write-Step "Starting PRIME applications"

# The backend must be restarted after pulls/schema changes so new Nest controllers
# and the freshly generated Prisma client are actually loaded.
if (Test-TcpPort $BackendPort) {
    Stop-ProcessOnPort $BackendPort "backend"
    Start-Sleep -Seconds 1
}

# Force safe local values in child processes as well. This overrides any
# machine-level environment variables that may contain production credentials.
$backendCommand = @(
    "title PRIME BACKEND",
    'set "NODE_ENV=development"',
    ('set "PORT={0}"' -f $BackendPort),
    ('set "DATABASE_URL={0}"' -f $LocalDatabaseUrl),
    'set "FRONTEND_URL=http://localhost:3000"',
    'set "CORS_ORIGINS=http://localhost:3000,http://localhost:3001"',
    'set "JWT_ACCESS_SECRET=prime-local-access-secret-do-not-use-in-production"',
    'set "JWT_REFRESH_SECRET=prime-local-refresh-secret-do-not-use-in-production"',
    'set "REDIS_HOST=127.0.0.1"',
    'set "REDIS_PORT=56379"',
    'set "REDIS_PASSWORD=prime_local_redis"',
    'set "REDIS_URL=redis://:prime_local_redis@127.0.0.1:56379"',
    'set "CLOUDINARY_CLOUD_NAME="',
    'set "CLOUDINARY_API_KEY="',
    'set "CLOUDINARY_API_SECRET="',
    'set "TELEGRAM_BOT_TOKEN="',
    'set "SMSRU_API_ID=local-development-disabled"',
    'set "SMSRU_FROM="',
    'set "SMSRU_TEST_MODE=true"',
    'set "AMOCRM_API_BASE_URL="',
    'set "AMOCRM_BASE_DOMAIN="',
    'set "AMOCRM_LONG_LIVED_TOKEN="',
    'set "AMOCRM_RESPONSIBLE_USER_ID="',
    'set "AMOCRM_PIPELINE_ID="',
    'set "AMOCRM_STATUS_ID="',
    'set "AMOCRM_CANCELLED_STATUS_ID="',
    "npm run start:dev"
) -join " && "

$frontendCommand = 'title PRIME SITE && set "NEXT_PUBLIC_API_URL={0}" && npm run dev' -f $ApiUrl
$adminCommand = 'title PRIME ADMIN && set "NEXT_PUBLIC_API_URL={0}" && npm run dev' -f $ApiUrl

Start-Process -FilePath "cmd.exe" -WorkingDirectory $BackendDir -ArgumentList "/k", $backendCommand | Out-Null

if (Test-TcpPort 3000) {
    Write-Host "Frontend port 3000 is already open; frontend start skipped." -ForegroundColor Yellow
} else {
    Start-Process -FilePath "cmd.exe" -WorkingDirectory $FrontendDir -ArgumentList "/k", $frontendCommand | Out-Null
}

if (Test-TcpPort 3001) {
    Write-Host "Admin port 3001 is already open; admin start skipped." -ForegroundColor Yellow
} else {
    Start-Process -FilePath "cmd.exe" -WorkingDirectory $AdminDir -ArgumentList "/k", $adminCommand | Out-Null
}

Write-Step "Waiting for applications"
$backendOk = Wait-ForPort $BackendPort "Backend"
$frontendOk = Wait-ForPort 3000 "Frontend"
$adminOk = Wait-ForPort 3001 "Admin"

if (-not ($backendOk -and $frontendOk -and $adminOk)) {
    Write-Host ""
    Write-Host "One or more applications did not start. Keep the three terminal windows open and check the error shown there." -ForegroundColor Red
    Write-Host "Backend: $BackendUrl/docs"
    Write-Host "Site:    http://localhost:3000"
    Write-Host "Admin:   http://localhost:3001"
    exit 1
}

Write-Host ""
Write-Host "PRIME local environment is running:" -ForegroundColor Green
Write-Host "  Site:    http://localhost:3000"
Write-Host "  Admin:   http://localhost:3001"
Write-Host "  Swagger: $BackendUrl/docs"
Write-Host ""
Write-Host "Local admin:" -ForegroundColor Green
Write-Host "  Email:    admin.local@prime.test"
Write-Host "  Password: PrimeLocal!2026"
Write-Host ""
Write-Host "The frontend and admin are pinned to the LOCAL API, not production." -ForegroundColor DarkGray

Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001"
