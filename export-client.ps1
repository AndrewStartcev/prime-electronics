[CmdletBinding()]
param(
    [string]$BaseRef = "",
    [string]$HeadRef = "HEAD"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$BaseFile = Join-Path $Root ".client-base"
$DeliveryRoot = Join-Path $Root ".client-delivery"

function Fail([string]$Message) {
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Invoke-Git([string[]]$Arguments) {
    & git -C $Root @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "Git not found in PATH."
}

if ([string]::IsNullOrWhiteSpace($BaseRef)) {
    if (-not (Test-Path -LiteralPath $BaseFile -PathType Leaf)) {
        Fail ".client-base not found."
    }
    $BaseRef = (Get-Content -LiteralPath $BaseFile -Raw).Trim()
}

if ([string]::IsNullOrWhiteSpace($BaseRef)) {
    Fail "Client base ref is empty."
}

& git -C $Root rev-parse --verify "$BaseRef^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "Invalid base ref: $BaseRef"
}

& git -C $Root rev-parse --verify "$HeadRef^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "Invalid head ref: $HeadRef"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outRoot = Join-Path $DeliveryRoot $stamp
New-Item -ItemType Directory -Force -Path $outRoot | Out-Null

$projects = @(
    @{ Name = "backend"; Prefix = "ecommerce-backend" },
    @{ Name = "site"; Prefix = "e-commerce" },
    @{ Name = "admin"; Prefix = "e-commerce-admin" }
)

$created = @()

foreach ($project in $projects) {
    $name = $project.Name
    $prefix = $project.Prefix

    $logLines = @(& git -C $Root log --reverse --format="%h %s" "$BaseRef..$HeadRef" -- $prefix)
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot read Git log for $prefix"
    }

    if ($logLines.Count -eq 0) {
        Write-Host "$name: no client changes" -ForegroundColor DarkGray
        continue
    }

    $projectOut = Join-Path $outRoot $name
    New-Item -ItemType Directory -Force -Path $projectOut | Out-Null

    Write-Host "Exporting $name..." -ForegroundColor Cyan

    & git -C $Root format-patch `
        --no-stat `
        "--relative=$prefix" `
        "--output-directory=$projectOut" `
        "$BaseRef..$HeadRef" `
        -- `
        $prefix | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "git format-patch failed for $prefix"
    }

    $summary = @(
        "PRIME Electronics client delivery",
        "Component: $name",
        "Source folder: $prefix",
        "Base: $BaseRef",
        "Head: $HeadRef",
        "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "",
        "Commits:",
        $logLines,
        "",
        "Apply in the corresponding original client repository:",
        "  git checkout -b feature/<task-name>",
        "  git am <path-to-this-folder>/*.patch",
        ""
    ) -join [Environment]::NewLine

    [System.IO.File]::WriteAllText(
        (Join-Path $projectOut "SUMMARY.txt"),
        $summary,
        (New-Object System.Text.UTF8Encoding($false))
    )

    $created += $name
}

$rootSummary = @(
    "PRIME Electronics delivery package",
    "Base: $BaseRef",
    "Head: $HeadRef",
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "Components: $($created -join ', ')",
    "",
    "Only changes inside ecommerce-backend, e-commerce and e-commerce-admin are exported.",
    "Root local-development files are not included.",
    ""
) -join [Environment]::NewLine

[System.IO.File]::WriteAllText(
    (Join-Path $outRoot "README.txt"),
    $rootSummary,
    (New-Object System.Text.UTF8Encoding($false))
)

Write-Host ""
if ($created.Count -eq 0) {
    Write-Host "No client code changes found between $BaseRef and $HeadRef." -ForegroundColor Yellow
} else {
    Write-Host "Client delivery prepared:" -ForegroundColor Green
    Write-Host "  $outRoot"
    Write-Host "  components: $($created -join ', ')"
}
