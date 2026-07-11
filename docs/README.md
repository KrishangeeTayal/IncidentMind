# IncidentMind — Design Overview

This folder collects design notes for the IncidentMind platform.

> The platform is being built for a hackathon. Prioritize clean
> architecture, code quality, maintainability, and extensibility.

## Core principles

1. **AI assists, humans decide.** The system never auto-deploys fixes.
   Every recommendation must pass Enkrypt AI evaluation and then
   human approval.
2. **Reduce MTTR.** The whole point of the platform is to shorten the
   time between alert and resolution.
3. **Composable agents.** All AI behaviour lives behind Mastra agents
   in `@incidentmind/agents`, so they can be reused and tested
   independently from the web UI.

## Subsystems

| Subsystem       | Owner              | Notes                                          |
| --------------- | ------------------ | ---------------------------------------------- |
| Web app         | `apps/web`         | Next.js + Tailwind + shadcn/ui                 |
| Persistence     | `apps/web` (Prisma) | PostgreSQL                                     |
| AI orchestration| `apps/mastra`      | Mastra agents, tools, workflows                |
| Agent library   | `packages/agents`  | Reusable agent definitions                     |
| Tool library    | `packages/tools`   | Tools available to agents                      |
| Prompts         | `packages/prompts` | LLM prompt templates                           |
| Shared types    | `packages/shared`  | Cross-app TypeScript types and constants       |
| Shared UI       | `packages/ui`      | Cross-app React components                     |

## Future integrations (not yet implemented)

- **Qdrant** — semantic search and long-term memory (RAG).
- **Enkrypt AI** — AI output evaluation, hallucination detection,
  safety guardrails, risk analysis.

Environment variable slots for both are already declared in
`.env.example` so they can be added without churn later.
