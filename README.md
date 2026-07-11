# IncidentMind

> **AI-powered Incident Response Platform built with Mastra, Qdrant and Enkrypt AI.**

Reduce Mean Time To Resolution (MTTR) through intelligent multi-agent investigations, semantic knowledge retrieval and safe human-in-the-loop approvals.

---

## Problem

When production incidents occur, engineering teams often spend valuable time manually correlating logs, metrics, deployment history and previous incidents before identifying the root cause.

This delays recovery, increases downtime, and places unnecessary pressure on on-call engineers.

IncidentMind accelerates incident response by orchestrating AI agents that investigate incidents, retrieve historical context, generate remediation recommendations, evaluate their safety, and always require human approval before any action is taken.

---
### Dashboard

> <img width="1353" height="633" alt="image" src="https://github.com/user-attachments/assets/8d2185d7-7660-4d13-aa30-df7332b28f99" />


### Incident Investigation Workspace

> *(Insert Incident Workspace screenshot here)*

### Analytics

> *(Insert Analytics screenshot here)*

### Knowledge Base

> *(Insert Knowledge Base screenshot here)*

---

# Features

- AI-powered incident investigation
- Multi-agent orchestration using Mastra
- Human-in-the-loop approval workflow
- Semantic incident retrieval with Qdrant
- AI safety evaluation using Enkrypt AI
- Historical incident knowledge base
- Operational analytics dashboard
- Root cause analysis workflow
- Evidence correlation
- Interactive production incident simulator

---

# How It Works

```text
Production Alert
        │
        ▼
Mastra Agent Workflow
        │
        ▼
Collect Logs + Metrics + Traces
        │
        ▼
Retrieve Similar Incidents (Qdrant)
        │
        ▼
Root Cause Analysis
        │
        ▼
Generate Recommendation
        │
        ▼
Enkrypt AI Safety Evaluation
        │
        ▼
Human Approval
        │
        ▼
Incident Resolution

---

## Architecture Overview

- **Mastra** — AI agent orchestration
- **Qdrant** — semantic search and long-term memory (RAG) _(future)_
- **Enkrypt AI** — output evaluation, hallucination detection, safety guardrails _(future)_
- **Next.js + Prisma + PostgreSQL** — web app, API, and persistence

---

## Repository Structure

```
incidentmind/
├── apps/
│   ├── web/         # Next.js application (UI + API routes)
│   └── mastra/      # Mastra AI orchestration service
├── packages/
│   ├── agents/      # Reusable agent definitions
│   ├── tools/       # Tools available to agents
│   ├── prompts/     # LLM prompt templates
│   ├── shared/      # Shared TypeScript types and utilities
│   └── ui/          # Shared UI components
├── database/        # Prisma schema and migrations
├── docs/            # Project documentation
└── package.json     # Root workspace configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.18
- **pnpm** >= 8.15
- **PostgreSQL** running locally (or a remote instance)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in DATABASE_URL and any LLM provider keys you have.
```

### 3. Generate the Prisma client

```bash
pnpm --filter @incidentmind/web prisma:generate
```

### 4. Run all apps in development

```bash
pnpm dev
```

This runs `apps/web` (Next.js) and `apps/mastra` in parallel.

You can also run them individually:

```bash
pnpm dev:web      # Next.js only
pnpm dev:mastra   # Mastra only
```

### Default ports

| App           | Port |
| ------------- | ---- |
| `apps/web`    | 3000 |
| `apps/mastra` | 4111 |

---

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `pnpm dev`              | Run all apps in dev mode (parallel)      |
| `pnpm dev:web`          | Run only the Next.js web app             |
| `pnpm dev:mastra`       | Run only the Mastra service              |
| `pnpm build`            | Build all apps                           |
| `pnpm lint`             | Lint all packages                        |
| `pnpm typecheck`        | TypeScript checks across all packages    |
| `pnpm format`           | Format the codebase with Prettier        |

---

## Current Status

This repository contains the **project foundation only**.

Implemented:
- Monorepo workspace structure
- Next.js + TypeScript + Tailwind + shadcn/ui
- Prisma + PostgreSQL wiring
- Mastra base configuration
- Placeholder pages
- Shared types package

Not yet implemented (per spec):
- API endpoints
- AI agents
- Qdrant integration
- Enkrypt AI integration
- Business logic, database schema, auth

See `docs/` for the design plan and roadmap.

---

## License

Internal hackathon project.
