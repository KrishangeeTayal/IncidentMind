# Mastra service

This app hosts the [Mastra](https://mastra.ai) AI orchestration runtime for
IncidentMind. It exposes agents, tools, and workflows that the Next.js
web app will call into.

## Status

- Configuration skeleton is in place (`mastra.config.ts`).
- No agents, tools, or workflows are registered yet — those will be added
  in subsequent iterations.
- Enkrypt AI evaluation and Qdrant memory are **not** wired in yet; they
  are intentionally left for later work.

## Run

```bash
pnpm dev:mastra
```

The service listens on the port configured by `MASTRA_PORT`
(default `4111`).
