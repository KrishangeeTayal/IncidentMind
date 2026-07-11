// Severity Classification Agent — assigns a P1–P4 tier to an incident.

import { renderSystemPrompt, severityClassificationPrompt } from '@incidentmind/prompts';
import type {
  SeverityClassification,
  SeverityClassificationInput,
  SeverityClassificationOutput,
  SeverityTier,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'severity-classification';

export class SeverityClassificationAgent {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async run(
    input: SeverityClassificationInput,
  ): Promise<SeverityClassificationOutput> {
    const system = renderSystemPrompt(severityClassificationPrompt);
    const user = JSON.stringify({ alert: input.alert }, null, 2);
    return this.llm.complete<SeverityClassificationOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
  }
}

// --- Mock generator --------------------------------------------------------

const KEYWORD_TIERS: Array<{ tier: SeverityTier; keywords: RegExp }> = [
  { tier: 'P1', keywords: /outage|5xx|down|customer[- ]facing|revenue|data loss/i },
  { tier: 'P2', keywords: /degraded|elevated error|spike|latency/i },
  { tier: 'P3', keywords: /warning|retry|slow|partial/i },
];

export function mockSeverityClassification(
  input: SeverityClassificationInput,
): SeverityClassification {
  const text = `${input.alert.title} ${input.alert.description}`.toLowerCase();

  let tier: SeverityTier = 'P4';
  for (const { tier: t, keywords } of KEYWORD_TIERS) {
    if (keywords.test(text)) {
      tier = t;
      break;
    }
  }

  return {
    severity: tier,
    reasoning: reasoningFor(tier, input),
    confidence: confidenceFor(tier, input),
  };
}

function reasoningFor(
  tier: SeverityTier,
  input: SeverityClassificationInput,
): string {
  switch (tier) {
    case 'P1':
      return `Alert "${input.alert.title}" indicates a customer-impacting issue that warrants immediate response.`;
    case 'P2':
      return `Alert "${input.alert.title}" shows significant degradation that should be addressed within the hour.`;
    case 'P3':
      return `Alert "${input.alert.title}" has limited impact and a workable mitigation path.`;
    case 'P4':
    default:
      return `Alert "${input.alert.title}" is informational or developer-facing.`;
  }
}

function confidenceFor(
  tier: SeverityTier,
  input: SeverityClassificationInput,
): number {
  // P4 fallback is the lowest-confidence path; everything else is high.
  if (tier === 'P4') {
    return input.alert.description.length > 20 ? 65 : 50;
  }
  return input.alert.environment === 'production' ? 92 : 85;
}
