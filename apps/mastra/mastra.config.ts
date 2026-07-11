// Mastra configuration entry point.
//
// Concrete agents and tools will be added in future iterations. The
// workflow skeleton is registered now so the service boots and exposes
// the incident response pipeline.

import { defineConfig } from '@mastra/core';
import { APP_NAME } from '@incidentmind/shared';

export default defineConfig({
  name: APP_NAME,
  // Agents, tools, vectors, and workflows will be added in later iterations.
  agents: {},
  tools: {},
  vectors: {},
  workflows: {},
});
