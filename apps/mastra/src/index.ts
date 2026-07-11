// Mastra service entry point.
//
// Re-exports the workflow and the agent layer so consumers can import
// a stable surface from a single path.

export { default } from '../mastra.config';
export * from './workflows/incident-workflow';
export * from '@incidentmind/agents';
export * from '@incidentmind/prompts';
