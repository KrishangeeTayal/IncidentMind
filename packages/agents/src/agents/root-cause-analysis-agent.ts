// Root Cause Analysis Agent — pinpoints the most likely cause.

import { renderSystemPrompt, rootCauseAnalysisPrompt } from '@incidentmind/prompts';
import type {
  RootCauseAnalysis,
  RootCauseAnalysisInput,
  RootCauseAnalysisOutput,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'root-cause-analysis';

export class RootCauseAnalysisAgent {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async run(input: RootCauseAnalysisInput): Promise<RootCauseAnalysisOutput> {
    const system = renderSystemPrompt(rootCauseAnalysisPrompt);
    const user = JSON.stringify(
      {
        alert: input.alert,
        classification: input.classification,
        context: input.context,
        signals: input.signals,
      },
      null,
      2,
    );
    return this.llm.complete<RootCauseAnalysisOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
  }
}

// --- Mock generator --------------------------------------------------------

export function mockRootCauseAnalysis(
  input: RootCauseAnalysisInput,
): RootCauseAnalysis {
  const evidence: string[] = [];
  if (input.signals.logs.length > 0) {
    evidence.push(`Log signal: ${input.signals.logs[0]}`);
  }
  if (input.signals.metrics.length > 0) {
    evidence.push(`Metric signal: ${input.signals.metrics[0]}`);
  }
  if (input.signals.github.length > 0) {
    evidence.push(`Recent change: ${input.signals.github[0]}`);
  }
  if (evidence.length === 0) {
    evidence.push(
      `No corroborating signals available for "${input.alert.title}".`,
    );
  }

  const hasStrongSignal =
    input.signals.logs.length + input.signals.metrics.length >= 2;

  return {
    rootCause: `The most likely cause of "${input.alert.title}" on ${input.alert.service} is a recent change or load pattern consistent with the provided signals.`,
    confidence: hasStrongSignal ? 88 : 72,
    evidence,
  };
}
