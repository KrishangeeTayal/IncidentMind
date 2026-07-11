# Database

This directory holds database configuration and migration files for the
IncidentMind platform.

## Prisma

Prisma is wired into `apps/web`. The schema file lives at
`apps/web/prisma/schema.prisma` and migrations will be generated into
`apps/web/prisma/migrations/`.

The Prisma client is generated and consumed inside the `apps/web` app. This
directory is reserved for shared database documentation, seed data, and any
non-app-specific database assets (for example, SQL scripts or admin queries).

## Connection

Set `DATABASE_URL` (and optionally `DIRECT_URL`) in `.env` before running any
Prisma commands. See `.env.example` at the repo root for the expected format.
