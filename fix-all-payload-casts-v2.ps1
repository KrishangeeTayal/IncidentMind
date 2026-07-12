# fix-all-payload-casts-v2.ps1 — finds and patches ALL `payload: input.payload,` lines in services
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Continue'
$root = (Get-Location).Path
$servicesDir = Join-Path $root 'apps\web\src\server\services'

if (-not (Test-Path -LiteralPath $servicesDir)) {
    Write-Host "ERROR: services directory not found: $servicesDir" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -LiteralPath $servicesDir -Filter '*.ts' -Recurse
$totalPatched = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $lines = $content -split "`n"
    $filePatched = $false
    $fileName = $file.Name

    for ($i = 0; $i -lt $lines.Count; $i++) {
        # Match lines like: payload: input.payload,  or  payload: input.payload
        if ($lines[$i] -match '^\s*payload:\s*input\.payload,?\s*$') {
            $oldLine = $lines[$i]
            $indent = ($oldLine -replace '^(\s*).*$', '$1')
            $newLine = $indent + "payload: (input.payload ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue,"
            $lines[$i] = $newLine
            $filePatched = $true
            $lineNo = $i + 1
            $tag = "  $($fileName):$lineNo"
            Write-Host $tag -ForegroundColor Cyan
            Write-Host "    - $($oldLine.Trim())"
            Write-Host "    + $($newLine.Trim())" -ForegroundColor Green
            $totalPatched++
        }
    }

    if ($filePatched) {
        $newContent = $lines -join "`n"
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Yellow
Write-Host "Total lines patched: $totalPatched" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: pnpm --filter @incidentmind/web build 2>&1 | Tee-Object build.log | Select-String -Pattern 'Type error|error TS|Module .* has no exported' | Select-Object -First 1" -ForegroundColor Cyan
