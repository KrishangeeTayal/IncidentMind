# IncidentMind — UI Redesign Patch

This archive contains every file modified during the UI redesign session.
The changes implement an enterprise SaaS look (Linear / Vercel / Datadog
style) with a blue primary palette, light gray background, separated
cards, and a dark sidebar.

## What's in here

| Tier | Files | Purpose |
|------|-------|---------|
| 1 (foundation) | `globals.css`, `ui/button.tsx`, `ui/badge.tsx`, `ui/card.tsx` | Design tokens, new card style, blue primary |
| 2 (chrome) | `sidebar.tsx`, `top-bar.tsx`, `app-shell.tsx`, `page-header.tsx` | Dark sidebar, white floating nav, slate-50 background |
| 3 (recolor) | 20+ component files | Purple/violet/fuchsia → blue across all components |
| 4 (polish) | Page orchestrators, headers, section heading | Larger titles, more spacing, better grid gaps |

## What didn't change

- Backend (services, API routes, Prisma)
- Business logic
- State management
- Routing
- Page structure / component hierarchy

Only Tailwind classes, spacing, and color tokens were modified.

## Apply

```powershell
cd C:\Users\user\Desktop\IncidentMind
# Extract on top of the existing repo (preserving paths)
tar -xzf incidentmind-ui-redesign.tar.gz -C C:\Users\user\Desktop\IncidentMind
```

Or, if you extracted with a top-level dir, use `--strip-components=1`.

## Deploy

After applying, redeploy:

```powershell
vercel --prod
```

The build should still pass — only Tailwind classes changed, no logic.
