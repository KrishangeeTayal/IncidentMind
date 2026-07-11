// Shared prompt structure used by every IncidentMind agent.
//
// Each prompt follows the same six-section layout so the LLM sees a
// consistent shape regardless of which agent is being invoked. Keeping
// the structure machine-readable also lets the agent layer stitch the
// sections into a single system + user message at call time.

export interface Prompt {
  /** Who the agent is. */
  role: string;
  /** Background information the agent should assume. */
  context: string;
  /** What the agent must do, step by step. */
  instructions: string;
  /** Hard rules the agent must never break. */
  constraints: string[];
  /** Required shape of the JSON output. */
  outputFormat: string;
  /** Worked example of a valid response. */
  example: string;
}

/**
 * Render a structured prompt into a single string suitable for the
 * `system` field of an LLM request.
 */
export function renderSystemPrompt(p: Prompt): string {
  return [
    `# Role\n${p.role.trim()}`,
    `# Context\n${p.context.trim()}`,
    `# Instructions\n${p.instructions.trim()}`,
    `# Constraints\n${p.constraints.map((c) => `- ${c.trim()}`).join('\n')}`,
    `# Output Format\n${p.outputFormat.trim()}`,
    `# Example\n${p.example.trim()}`,
  ].join('\n\n');
}
