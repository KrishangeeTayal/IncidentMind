# fix-inputjson-cast.ps1 — replaces `as unknown as Prisma.InputJsonValue` with `as any`
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Continue'
$root = (Get-Location).Path
$servicesDir = Join-Path $root 'apps\web\src\server\services'

if (-not (Test-Path -LiteralPath $servicesDir)) {
    Write-Host "ERROR: services dir not found" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -LiteralPath $servicesDir -Filter '*.ts' -Recurse
$totalFixed = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $fileName = $file.Name

    if ($content -match 'as unknown as Prisma\.InputJsonValue') {
        Write-Host "  $($fileName): found cast" -ForegroundColor Yellow
        $content = $content.Replace(' as unknown as Prisma.InputJsonValue', ' as any')
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $totalFixed++
        Write-Host "    -> replaced with 'as any'" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total files fixed: $totalFixed" -ForegroundColor Green
