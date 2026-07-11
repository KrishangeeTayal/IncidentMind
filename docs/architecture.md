# Architecture

## High-level flow

```
┌────────────┐    ┌──────────────────┐    ┌───────────────┐
│  Web app   │ →  │   Mastra agents  │ →  │  LLM provider │
│ (Next.js)  │    │ (apps/mastra)    │    │ (OpenAI, etc) │
└────────────┘    └──────────────────┘    └───────────────┘
       │                   │
       │                   ▼
       │           ┌──────────────────┐
       │           │   Enkrypt AI     │  (future)
       │           │   (guardrails)   │
       │           └──────────────────┘
       ▼
┌────────────┐
│ PostgreSQL │
│ (Prisma)   │
└────────────┘
```

## Layered code organization

- `apps/web` — UI and Next.js route handlers. No AI logic lives here.
- `apps/mastra` — Mastra runtime. Registers agents, tools, vectors,
  workflows.
- `packages/agents` — Reusable agent definitions (imported by
  `apps/mastra`).
- `packages/tools` — Reusable tool implementations.
- `packages/prompts` — Prompt templates.
- `packages/shared` — Cross-app types, constants, utilities.
- `packages/ui` — Cross-app React components.

## Data flow (planned)

1. An alert is created in PostgreSQL (Prisma).
2. A Mastra workflow ingests the alert and asks the relevant agent
   for context.
3. The agent retrieves prior incidents / runbooks from Qdrant
   (future) and proposes a recommendation.
4. The recommendation is sent to Enkrypt AI (future) for safety and
   hallucination checks.
5. The recommendation is shown to a human in the web app.
6. **Only** after a human approves, the system may emit follow-up
   actions. The platform never auto-deploys fixes.
