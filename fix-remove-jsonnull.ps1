# fix-remove-jsonnull.ps1 — replaces `?? Prisma.JsonNull` with `?? null` in all service files
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Continue'
$root = (Get-Location).Path
$servicesDir = Join-Path $root 'apps\web\src\server\services'

if (-not (Test-Path -LiteralPath $servicesDir)) {
    Write-Host "ERROR: services dir not found: $servicesDir" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -LiteralPath $servicesDir -Filter '*.ts' -Recurse
$totalFixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $fileName = $file.Name

    if ($content -match '\?\?\s*Prisma\.JsonNull') {
        Write-Host "  $($fileName): found Prisma.JsonNull" -ForegroundColor Yellow
        $content = $content.Replace(' ?? Prisma.JsonNull', ' ?? null')
        $content = $content.Replace('?? Prisma.JsonNull', '?? null')
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $totalFixed++
        Write-Host "    -> replaced with ?? null" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total files fixed: $totalFixed" -ForegroundColor Green
