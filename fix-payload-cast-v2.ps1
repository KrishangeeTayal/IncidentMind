# fix-payload-cast-v2.ps1 — uses a permissive cast that works on stricter Prisma versions
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Continue'
$path = Join-Path (Get-Location).Path 'apps\web\src\server\services\approval-service.ts'

if (-not (Test-Path -LiteralPath $path)) {
    Write-Host "ERROR: file not found: $path" -ForegroundColor Red
    exit 1
}

$content = [System.IO.File]::ReadAllText($path)
$lines = $content -split "`n"

# Find the existing cast line (it has Prisma.InputJsonValue in it)
$matchIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'payload:\s*\(input\.payload.*Prisma\.InputJsonValue') {
        $matchIdx = $i
        break
    }
}

if ($matchIdx -lt 0) {
    Write-Host "ERROR: could not find the existing cast line" -ForegroundColor Red
    exit 1
}

$oldLine = $lines[$matchIdx]
$indent = ($oldLine -replace '^(\s*).*$', '$1')

# Use `as unknown as` to bypass strict type compatibility
$newLine = $indent + "payload: (input.payload ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue,"

Write-Host "Found at line $($matchIdx + 1):" -ForegroundColor Yellow
Write-Host "  OLD: $oldLine"
Write-Host "  NEW: $newLine"

$lines[$matchIdx] = $newLine
$newContent = $lines -join "`n"
[System.IO.File]::WriteAllText($path, $newContent)
Write-Host "`nOK - patched!" -ForegroundColor Green
Write-Host "`nNow run: pnpm --filter @incidentmind/web build" -ForegroundColor Cyan
