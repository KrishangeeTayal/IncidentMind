// Post-Mortem Agent — drafts an incident post-mortem.

import { renderSystemPrompt, postMortemPrompt } from '@incidentmind/prompts';
import type {
  PostMortem,
  PostMortemInput,
  PostMortemOutput,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'post-mortem';

export class PostMortemAgent {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async run(input: PostMortemInput): Promise<PostMortemOutput> {
    const system = renderSystemPrompt(postMortemPrompt);
    const user = JSON.stringify(
      {
        alert: input.alert,
        classification: input.classification,
        context: input.context,
        rca: input.rca,
        resolution: input.resolution,
      },
      null,
      2,
    );
    return this.llm.complete<PostMortemOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
  }
}

// --- Mock generator --------------------------------------------------------

export function mockPostMortem(input: PostMortemInput): PostMortem {
  const summary =
    `Incident on ${input.alert.service} (${input.alert.environment}) was ` +
    `classified ${input.classification.severity} and resolved via the ` +
    `recommended plan. Root cause: ${input.rca.rootCause}`;

  const lessonsLearned = [
    `${input.alert.service} lacks sufficient pre-deploy signal in ${input.alert.environment}.`,
    `Alert "${input.alert.title}" was detected promptly by monitoring.`,
    `Confidence in the recommendation was ${input.resolution.confidence}/100.`,
  ];

  const actionItems = [
    `team:platform — review the change that caused "${input.alert.title}".`,
    `team:sre — add a runbook for ${input.alert.service} in Qdrant.`,
    `team:platform — schedule a follow-up review in 7 days.`,
  ];

  return {
    summary,
    rootCause: input.rca.rootCause,
    resolution: input.resolution.recommendation,
    lessonsLearned,
    actionItems,
  };
}
