# fix-add-postinstall.ps1 — adds postinstall script to apps/web/package.json
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Stop'
$path = Join-Path (Get-Location).Path 'apps\web\package.json'

if (-not (Test-Path -LiteralPath $path)) {
    Write-Host "ERROR: package.json not found at $path" -ForegroundColor Red
    exit 1
}

$content = [System.IO.File]::ReadAllText($path)

# Check if postinstall already exists
if ($content -match '"postinstall"\s*:') {
    Write-Host "postinstall already exists in package.json" -ForegroundColor Yellow
    Write-Host "Current scripts:" -ForegroundColor Cyan
    $content -split "`n" | Select-String "postinstall|build" | ForEach-Object { $_.Line }
    exit 0
}

# Find the "scripts" section and add postinstall
# Look for the opening "scripts": { and the first script after it
$pattern = '("scripts"\s*:\s*\{)(\s*)(")([a-zA-Z\-]+)"'
if ($content -match $pattern) {
    $newContent = $content -replace $pattern, ('$1$2"postinstall": "prisma generate",$2$3$4"')
    [System.IO.File]::WriteAllText($path, $newContent)
    Write-Host "OK - added postinstall script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Updated scripts section:" -ForegroundColor Cyan
    $newContent -split "`n" | Select-String "postinstall" | ForEach-Object { $_.Line }
} else {
    Write-Host "ERROR: could not find scripts section" -ForegroundColor Red
    exit 1
}
