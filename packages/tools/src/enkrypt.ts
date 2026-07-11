// Enkrypt AI integration wrapper.
//
// Placeholder for output evaluation, hallucination detection, safety
// guardrails, and risk analysis. Real implementation will hit the
// Enkrypt AI HTTP API.

export type EnkryptVerdict = 'pass' | 'warn' | 'fail';

export interface EnkryptEvaluationRequest {
  /** The raw output produced by an agent. */
  output: string;
  /** Optional structured context the agent worked from. */
  context?: Record<string, unknown>;
  /** Which guardrails / detectors to apply. */
  guardrailId?: string;
  detectorId?: string;
}

export interface EnkryptEvaluationResult {
  verdict: EnkryptVerdict;
  score: number; // 0..1, higher = safer
  reasons: string[];
  raw?: Record<string, unknown>;
}

export interface EnkryptConfig {
  apiKey: string;
  apiUrl?: string;
  guardrailId?: string;
  detectorId?: string;
}

export interface EnkryptClient {
  evaluate(req: EnkryptEvaluationRequest): Promise<EnkryptEvaluationResult>;
  ping(): Promise<boolean>;
}

/**
 * Build an Enkrypt AI client.
 *
 * NOTE: stub. Real implementation will be added in a later iteration.
 */
export function createEnkryptClient(_config: EnkryptConfig): EnkryptClient {
  const notImplemented = (name: string): never => {
    throw new Error(`[enkrypt] ${name}() not implemented`);
  };
  return {
    evaluate: () =>
      Promise.resolve({ verdict: 'pass', score: 1, reasons: [] }).then(() => {
        notImplemented('evaluate');
      }),
    ping: () => Promise.resolve(false),
  };
}
