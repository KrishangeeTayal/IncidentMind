# fix-user-build-v3.ps1 — fixes the [id] wildcard interpretation
# Run from C:\Users\user\Desktop\IncidentMind

$ErrorActionPreference = 'Continue'
$root = (Get-Location).Path

function Patch-File {
    param([string]$Path, [string[]]$Replacements)
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Host "  ! file not found: $Path" -ForegroundColor Yellow
        return
    }
    $content = [System.IO.File]::ReadAllText($Path)
    foreach ($r in $Replacements) {
        $parts = $r -split ' \| ', 2
        $old = $parts[0]
        $new = $parts[1]
        if ($content -notmatch [regex]::Escape($old)) {
            Write-Host "  ! not found in file: $old" -ForegroundColor Yellow
            continue
        }
        $content = $content.Replace($old, $new)
        Write-Host "  + patched" -ForegroundColor Green
    }
    [System.IO.File]::WriteAllText($Path, $content)
}

# Use LiteralPath throughout to avoid wildcard expansion on [id]
$incDir = 'apps\web\src\app\api\incidents\[id]'

# === File 1: approval-service.ts (likely already patched, will skip) ===
$s1 = Join-Path $root 'apps\web\src\server\services\approval-service.ts'
Write-Host "[1/3] Patching approval-service.ts" -ForegroundColor Cyan
Patch-File $s1 @(
    "import { newCorrelationId } from '@incidentmind/shared'; | import { newCorrelationId } from '@incidentmind/shared/logger';"
    "          payload: input.payload, |           payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,"
)

# === File 2: approve/route.ts ===
$s2 = Join-Path $root "$incDir\approve\route.ts"
Write-Host "[2/3] Patching approve/route.ts" -ForegroundColor Cyan
Write-Host "    path: $s2"
Patch-File $s2 @(
    "import { newCorrelationId, type ApprovalRequest } from '@incidentmind/shared'; | import { newCorrelationId } from '@incidentmind/shared/logger';
import type { ApprovalRequest } from '@incidentmind/shared';"
)

# === File 3: reject/route.ts ===
$s3 = Join-Path $root "$incDir\reject\route.ts"
Write-Host "[3/3] Patching reject/route.ts" -ForegroundColor Cyan
Write-Host "    path: $s3"
Patch-File $s3 @(
    "import { newCorrelationId, type ApprovalRequest } from '@incidentmind/shared'; | import { newCorrelationId } from '@incidentmind/shared/logger';
import type { ApprovalRequest } from '@incidentmind/shared';"
    "import { ApprovalService, TimelineService } from '@/server/services'; | import { ApprovalService, TimelineService } from '@/server/services';
import type { CreateApprovalInput } from '@/server/services/approval-service';"
    "        .createPending({ incidentId: id, payload: body.payload ?? {} }) |         .createPending({ incidentId: id, payload: (body.payload ?? {}) as CreateApprovalInput['payload'] })"
)

Write-Host "`nDone. Now run the build:" -ForegroundColor Green
Write-Host "  pnpm --filter @incidentmind/web build 2>&1 | Tee-Object build.log | Select-String -Pattern 'Type error|error TS|Module .* has no exported' | Select-Object -First 1" -ForegroundColor Yellow
