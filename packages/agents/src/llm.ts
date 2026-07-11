// LLM client abstraction.
//
// The agent layer talks to a generic `LLMClient` rather than to a
// specific provider. The default `MockLLMClient` produces deterministic
// JSON responses so the workflow can be exercised end-to-end without
// any external LLM dependency. A real provider-backed implementation
// (OpenAI, Anthropic, etc.) can be plugged in later by registering a
// different `LLMClient` instance with the agents.

import type {
  AlertIntakeInput,
  ContextRetrievalInput,
  LearningInput,
  PostMortemInput,
  ResolutionRecommendationInput,
  RootCauseAnalysisInput,
  SeverityClassificationInput,
} from './types';

export interface LLMRequest {
  system: string;
  user: string;
  /** Optional identifier used by the mock to dispatch to the right generator. */
  agentName?: string;
}

export interface LLMClient {
  complete<T>(req: LLMRequest): Promise<T>;
}

export type AgentName =
  | 'alert-intake'
  | 'severity-classification'
  | 'context-retrieval'
  | 'root-cause-analysis'
  | 'resolution-recommendation'
  | 'post-mortem'
  | 'learning';

export interface MockAgentInputs {
  alertIntake: AlertIntakeInput;
  severity: SeverityClassificationInput;
  context: ContextRetrievalInput;
  rca: RootCauseAnalysisInput;
  resolution: ResolutionRecommendationInput;
  postMortem: PostMortemInput;
  learning: LearningInput;
}

/**
 * Default LLM client. Each agent registers a deterministic generator
 * via `register(agentName, generator)`. The mock simply looks up the
 * generator for the request's `agentName` and returns its output.
 *
 * Why deterministic? Two reasons:
 *   1. The hackathon foundation needs to work without any LLM provider
 *      configured, so the workflow can be exercised in CI / dev.
 *   2. Deterministic output makes the workflow's downstream behavior
 *      (Enkrypt gating, post-mortem) testable.
 */
export class MockLLMClient implements LLMClient {
  private readonly inputs: MockAgentInputs;
  private readonly generators: Map<AgentName, (input: unknown) => unknown>;

  constructor(inputs: MockAgentInputs) {
    this.inputs = inputs;
    this.generators = new Map();
  }

  /** Register the deterministic generator for a given agent. */
  register(agentName: AgentName, generator: (input: unknown) => unknown): void {
    this.generators.set(agentName, generator);
  }

  async complete<T>(req: LLMRequest): Promise<T> {
    if (!req.agentName) {
      throw new Error('MockLLMClient: agentName is required on the request');
    }
    const name = req.agentName as AgentName;
    const generator = this.generators.get(name);
    if (!generator) {
      throw new Error(`MockLLMClient: no generator registered for ${name}`);
    }
    const input = this.pickInput(name);
    return generator(input) as T;
  }

  private pickInput(name: AgentName): unknown {
    switch (name) {
      case 'alert-intake':
        return this.inputs.alertIntake;
      case 'severity-classification':
        return this.inputs.severity;
      case 'context-retrieval':
        return this.inputs.context;
      case 'root-cause-analysis':
        return this.inputs.rca;
      case 'resolution-recommendation':
        return this.inputs.resolution;
      case 'post-mortem':
        return this.inputs.postMortem;
      case 'learning':
        return this.inputs.learning;
      default: {
        const _never: never = name;
        void _never;
        return undefined;
      }
    }
  }
}
