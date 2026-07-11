// Resolution Recommendation Agent — proposes a remediation plan.

import { renderSystemPrompt, resolutionRecommendationPrompt } from '@incidentmind/prompts';
import type {
  ResolutionRecommendation,
  ResolutionRecommendationInput,
  ResolutionRecommendationOutput,
  RiskLevel,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'resolution-recommendation';

export class ResolutionRecommendationAgent {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async run(
    input: ResolutionRecommendationInput,
  ): Promise<ResolutionRecommendationOutput> {
    const system = renderSystemPrompt(resolutionRecommendationPrompt);
    const user = JSON.stringify(
      {
        alert: input.alert,
        classification: input.classification,
        context: input.context,
        rca: input.rca,
      },
      null,
      2,
    );
    return this.llm.complete<ResolutionRecommendationOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
  }
}

// --- Mock generator --------------------------------------------------------

const RISK_BY_TIER: Record<'P1' | 'P2' | 'P3' | 'P4', RiskLevel> = {
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
  P4: 'Low',
};

export function mockResolutionRecommendation(
  input: ResolutionRecommendationInput,
): ResolutionRecommendation {
  const tier = input.classification.severity;
  const riskLevel = RISK_BY_TIER[tier];

  const recommendation =
    tier === 'P1'
      ? `1. Roll back the most recent change to ${input.alert.service}. ` +
        `2. Confirm the alert metric returns to baseline. ` +
        `3. Open a follow-up to address the root cause: ${input.rca.rootCause}`
      : `1. Apply the runbook for ${input.alert.service} (no match in context — generic guidance used). ` +
        `2. Monitor the alert metric. ` +
        `3. File a follow-up if the issue persists.`;

  return {
    recommendation,
    riskLevel,
    confidence: input.rca.confidence > 80 ? 85 : 70,
  };
}
