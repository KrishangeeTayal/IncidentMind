// Mastra instance — required entry point for `mastra build`.
//
// The IncidentMind pipeline is wired as plain TypeScript functions in
// src/workflows. This file just gives the build CLI a valid `Mastra`
// instance to discover. Workflows and agents are loaded as file-based
// primitives automatically.

import { Mastra } from '@mastra/core';
import { APP_NAME } from '@incidentmind/shared';

export const mastra = new Mastra({
  name: APP_NAME,
});

export default mastra;
