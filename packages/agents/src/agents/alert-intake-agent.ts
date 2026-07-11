// Alert Intake Agent — normalizes a raw alert into a stable shape.

import { createHash } from 'node:crypto';
import { renderSystemPrompt, alertIntakePrompt } from '@incidentmind/prompts';
import type {
  AlertIntakeInput,
  AlertIntakeOutput,
  Environment,
  NormalizedAlert,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'alert-intake';

export class AlertIntakeAgent {
  private readonly llm: LLMClient;

  constructor(llm: LLMClient) {
    this.llm = llm;
  }

  async run(input: AlertIntakeInput): Promise<AlertIntakeOutput> {
    const system = renderSystemPrompt(alertIntakePrompt);
    const user = JSON.stringify({ alert: input.alert }, null, 2);
    const result = await this.llm.complete<AlertIntakeOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
    return result;
  }
}

// --- Mock generator --------------------------------------------------------

/**
 * Deterministic mock used by `MockLLMClient`. Mirrors the rules in the
 * prompt so tests and the workflow can exercise the agent without a
 * real LLM.
 */
export function mockAlertIntake(input: AlertIntakeInput): AlertIntakeOutput {
  const { alert, receivedAt } = input;
  const corrections: string[] = [];

  const title = stringOr(alert.title, 'Untitled alert');
  const description = stringOr(alert.description, title);
  const service = stringOr(alert.service, 'unknown-service');
  const environment = coerceEnvironment(alert.environment, corrections);
  const source = stringOr(alert.source, 'unknown');

  const fingerprintInput = `${title}|${service}|${environment}`;
  const fingerprint = createHash('sha256').update(fingerprintInput).digest('hex');

  if (alert.title === undefined) corrections.push('title defaulted to "Untitled alert"');
  if (alert.description === undefined) corrections.push('description defaulted to title');
  if (alert.service === undefined) corrections.push('service defaulted to "unknown-service"');
  if (alert.environment === undefined) corrections.push('environment defaulted to "production"');
  if (alert.source === undefined) corrections.push('source defaulted to "unknown"');

  const normalized: NormalizedAlert = {
    title,
    description,
    service,
    environment,
    source,
    fingerprint,
    receivedAt: receivedAt ?? new Date().toISOString(),
    raw: alert as Record<string, unknown>,
    corrections,
  };

  return { normalized };
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function coerceEnvironment(value: unknown, corrections: string[]): Environment {
  if (typeof value !== 'string') {
    corrections.push('environment defaulted to "production"');
    return 'production';
  }
  const allowed: Environment[] = ['development', 'staging', 'production'];
  if ((allowed as string[]).includes(value)) return value as Environment;
  corrections.push(`environment "${value}" unrecognized; defaulted to "production"`);
  return 'production';
}
