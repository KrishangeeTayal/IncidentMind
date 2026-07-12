# IncidentMind — UI REVERT Patch

This archive contains every file modified to REVERT the UI redesign,
restoring the pre-redesign visual state (purple/violet accents, light
sidebar, white background, smaller spacing). The build fix changes
(Prisma casts, payload fixes, mastra entry point) are NOT touched.

## What's reverted

| File | Change |
|------|--------|
| `apps/web/src/app/globals.css` | `.im-card` → rounded-2xl/50-border, --background → white, --border → slate-200/50 |
| `apps/web/src/components/ui/button.tsx` | blue-600 default → bg-primary (uses theme) |
| `apps/web/src/components/ui/badge.tsx` | ai variant → violet-50/violet-700 |
| `apps/web/src/components/ui/card.tsx` | rounded-2xl, single subtle shadow |
| `apps/web/src/components/sidebar.tsx` | dark slate-900 → light white with violet active |
| `apps/web/src/components/top-bar.tsx` | blue-600 brand chip → slate-900 |
| `apps/web/src/components/app-shell.tsx` | bg-slate-50 → bg-white |
| `apps/web/src/components/page-header.tsx` | text-3xl font-bold → text-2xl font-semibold |
| `apps/web/src/components/workspace/workspace-page-client.tsx` | space-y-8 → space-y-6 |
| `apps/web/src/components/workspace/section-heading.tsx` | text-lg → text-base |
| Page orchestrators (overview, analytics, knowledge) | space-y-8 → space-y-6 |
| All grid layouts | gap-6 → gap-4 |
| All page titles | text-3xl font-bold → text-2xl font-semibold |
| Bulk recolor | blue-50..900 → violet-50..900 (approximate) |
| incident-detail-drawer.tsx | accent="blue" → accent="violet" |

## What's NOT touched

- All `apps/web/src/server/` files (the build fix is preserved)
- `apps/mastra/` (the mastra entry point is preserved)
- `apps/web/prisma/schema.prisma`
- Any backend / API / business logic

## Apply

```powershell
cd C:\Users\user\Desktop\IncidentMind
tar -xzf incidentmind-ui-revert.tar.gz --strip-components=1
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
pnpm --filter @incidentmind/web build 2>&1 | Select-String "Compiled successfully|Failed" | Select-Object -First 1
```

If "Compiled successfully" → run `vercel --prod` to deploy.
