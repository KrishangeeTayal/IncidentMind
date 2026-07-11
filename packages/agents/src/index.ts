// Public surface of the agents package.

export * from './types';
export * from './llm';

export { AlertIntakeAgent, mockAlertIntake } from './agents/alert-intake-agent';
export {
  SeverityClassificationAgent,
  mockSeverityClassification,
} from './agents/severity-classification-agent';
export {
  ContextRetrievalAgent,
  bucketQdrantResults,
  maybeQdrantClient as maybeContextRetrievalQdrantClient,
  mockContextRetrieval,
} from './agents/context-retrieval-agent';
export {
  RootCauseAnalysisAgent,
  mockRootCauseAnalysis,
} from './agents/root-cause-analysis-agent';
export {
  ResolutionRecommendationAgent,
  mockResolutionRecommendation,
} from './agents/resolution-recommendation-agent';
export { PostMortemAgent, mockPostMortem } from './agents/post-mortem-agent';
export {
  LearningAgent,
  maybeQdrantClient as maybeLearningQdrantClient,
  mockLearning,
} from './agents/learning-agent';

/**
 * Register every deterministic mock generator on a `MockLLMClient`.
 * Returns the configured client so callers can plug it in.
 */
export function buildMockLLMClient(inputs: MockAgentInputs): MockLLMClient {
  const client = new MockLLMClient(inputs);
  client.register('alert-intake', mockAlertIntake as (input: unknown) => unknown);
  client.register('severity-classification', mockSeverityClassification as (input: unknown) => unknown);
  client.register('context-retrieval', mockContextRetrieval as (input: unknown) => unknown);
  client.register('root-cause-analysis', mockRootCauseAnalysis as (input: unknown) => unknown);
  client.register(
    'resolution-recommendation',
    mockResolutionRecommendation as (input: unknown) => unknown,
  );
  client.register('post-mortem', mockPostMortem as (input: unknown) => unknown);
  client.register('learning', mockLearning as (input: unknown) => unknown);
  return client;
}
