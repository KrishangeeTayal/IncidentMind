// Incident response workflow.
//
// This file is the orchestrator that wires the seven IncidentMind
// agents together with the Enkrypt AI evaluation step. The pipeline:
//
//   Alert Intake
//        ↓
//   Classification
//        ↓
//   Context Retrieval (Qdrant — future)
//        ↓
//   Root Cause Analysis
//        ↓
//   Resolution Recommendation
//        ↓
//   Enkrypt AI Evaluation      ← gates the rest
//        ↓ (verdict ok)
//   Human Approval             ← placeholder; never auto-deploys
//        ↓
//   Timeline Builder           ← consolidates step outputs into events
//        ↓
//   Post-Mortem
//        ↓
//   Learning (Qdrant — future)
//
// Every step is logged through the shared logger so the timeline and
// the workflow log stream stay aligned.

import {
  AlertIntakeAgent,
  ContextRetrievalAgent,
  LearningAgent,
  PostMortemAgent,
  ResolutionRecommendationAgent,
  RootCauseAnalysisAgent,
  SeverityClassificationAgent,
  buildMockLLMClient,
  maybeContextRetrievalQdrantClient,
  maybeLearningQdrantClient,
  type AlertIntakeInput,
  type ContextRetrievalInput,
  type EnkryptEvaluation,
  type LearningInput,
  type LLMClient,
  type NormalizedAlert,
  type PostMortem,
  type PostMortemInput,
  type ResolutionRecommendation,
  type ResolutionRecommendationInput,
  type RetrievedContext,
  type RootCauseAnalysis,
  type RootCauseAnalysisInput,
  type SeverityClassification,
  type SeverityClassificationInput,
} from '@incidentmind/agents';
import {
  createEnkryptClient,
  type EnkryptClient,
  type EnkryptEvaluationRequest,
  type EnkryptEvaluationResult,
} from '@incidentmind/tools';
import { createLogger, newCorrelationId } from "@incidentmind/shared/logger";
import type { LogEntry } from "@incidentmind/shared";

export type WorkflowStepName =
  | 'alert_intake'
  | 'classification'
  | 'context_retrieval'
  | 'root_cause_analysis'
  | 'resolution_recommendation'
  | 'enkrypt_evaluation'
  | 'human_approval'
  | 'timeline_builder'
  | 'post_mortem'
  | 'learning';

export const WORKFLOW_STEPS: readonly WorkflowStepName[] = [
  'alert_intake',
  'classification',
  'context_retrieval',
  'root_cause_analysis',
  'resolution_recommendation',
  'enkrypt_evaluation',
  'human_approval',
  'timeline_builder',
  'post_mortem',
  'learning',
] as const;

export interface WorkflowContext {
  /** Correlation id tying logs and timeline events together. */
  correlationId: string;
  /** The original alert that triggered the workflow. */
  alert: Record<string, unknown>;
  /** Step outputs accumulate here as the workflow progresses. */
  state: Partial<Record<WorkflowStepName, unknown>>;
  /** Per-step log entries, useful for the timeline builder and replay. */
  log: LogEntry[];
}

export type WorkflowStatus = 'completed' | 'stopped';

export interface WorkflowResult {
  status: WorkflowStatus;
  /** Reason the workflow stopped early, if applicable. */
  stoppedAt?: WorkflowStepName;
  stopReason?: string;
  context: WorkflowContext;
}

const logger = createLogger({ agentName: 'incident-workflow' });

// --- Agent construction ----------------------------------------------------

export interface WorkflowDeps {
  llm?: LLMClient;
  enkrypt?: EnkryptClient;
  qdrant?: {
    contextRetrieval?: ReturnType<typeof maybeContextRetrievalQdrantClient>;
    learning?: ReturnType<typeof maybeLearningQdrantClient>;
  };
}

/**
 * Build the default set of agents. The default uses a deterministic
 * `MockLLMClient` so the workflow can be exercised in dev / CI without
 * an LLM provider. Callers can pass a real `LLMClient` via `deps.llm`
 * to swap in a live provider.
 */
export function buildAgents(deps: WorkflowDeps = {}): {
  alertIntake: AlertIntakeAgent;
  classification: SeverityClassificationAgent;
  contextRetrieval: ContextRetrievalAgent;
  rca: RootCauseAnalysisAgent;
  resolution: ResolutionRecommendationAgent;
  postMortem: PostMortemAgent;
  learning: LearningAgent;
  llm: LLMClient;
  enkrypt: EnkryptClient;
} {
  const llm: LLMClient =
    deps.llm ??
    buildMockLLMClient({
      alertIntake: { alert: {} } as AlertIntakeInput,
      severity: { alert: {} as NormalizedAlert } as SeverityClassificationInput,
      context: {
        alert: {} as NormalizedAlert,
        classification: {} as SeverityClassification,
      } as ContextRetrievalInput,
      rca: {
        alert: {} as NormalizedAlert,
        classification: {} as SeverityClassification,
        context: {} as RetrievedContext,
        signals: { logs: [], metrics: [], github: [] },
      } as RootCauseAnalysisInput,
      resolution: {
        alert: {} as NormalizedAlert,
        classification: {} as SeverityClassification,
        context: {} as RetrievedContext,
        rca: {} as RootCauseAnalysis,
      } as ResolutionRecommendationInput,
      postMortem: {
        alert: {} as NormalizedAlert,
        classification: {} as SeverityClassification,
        context: {} as RetrievedContext,
        rca: {} as RootCauseAnalysis,
        resolution: {} as ResolutionRecommendation,
      } as PostMortemInput,
      learning: {
        alert: {} as NormalizedAlert,
        classification: {} as SeverityClassification,
        rca: {} as RootCauseAnalysis,
        resolution: {} as ResolutionRecommendation,
        postMortem: {} as PostMortem,
      } as LearningInput,
    });

  const enkrypt: EnkryptClient =
    deps.enkrypt ??
    createEnkryptClient({
      apiKey: process.env.ENKRYPT_API_KEY ?? 'stub',
      apiUrl: process.env.ENKRYPT_API_URL,
    });

  const qdrant = deps.qdrant ?? {
    contextRetrieval: maybeContextRetrievalQdrantClient(),
    learning: maybeLearningQdrantClient(),
  };

  return {
    alertIntake: new AlertIntakeAgent(llm),
    classification: new SeverityClassificationAgent(llm),
    contextRetrieval: new ContextRetrievalAgent({
      llm,
      ...(qdrant.contextRetrieval ? { qdrant: qdrant.contextRetrieval } : {}),
    }),
    rca: new RootCauseAnalysisAgent(llm),
    resolution: new ResolutionRecommendationAgent(llm),
    postMortem: new PostMortemAgent(llm),
    learning: new LearningAgent({
      llm,
      ...(qdrant.learning ? { qdrant: qdrant.learning } : {}),
    }),
    llm,
    enkrypt,
  };
}

// --- Context creation ------------------------------------------------------

/**
 * Build the initial workflow context. The alert body comes from the
 * API request that triggered the workflow.
 */
export function createWorkflowContext(alert: Record<string, unknown>): WorkflowContext {
  const correlationId =
    typeof alert.correlationId === 'string' && alert.correlationId.length > 0
      ? alert.correlationId
      : newCorrelationId();

  return {
    correlationId,
    alert,
    state: {},
    log: [],
  };
}

// --- Run ------------------------------------------------------------------

/**
 * Run the workflow end-to-end. The default behavior uses the mock
 * LLM + a stub Enkrypt client. Pass `deps` to override either.
 */
export async function runIncidentWorkflow(
  ctx: WorkflowContext,
  deps: WorkflowDeps = {},
): Promise<WorkflowResult> {
  const agents = buildAgents(deps);

  for (const step of WORKFLOW_STEPS) {
    const child = logger.child(`step:${step}`, ctx.correlationId);
    child.start();
    try {
      const output = await runStep(step, ctx, agents);
      ctx.state[step] = output;
      ctx.log.push({
        agentName: `step:${step}`,
        correlationId: ctx.correlationId,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
      });
      child.succeed();

      // Enkrypt gate: if the evaluation says to stop, halt before
      // human approval (and the steps that follow).
      if (step === 'enkrypt_evaluation') {
        const evaluation = output as EnkryptEvaluation | undefined;
        if (evaluation?.stopBeforeApproval) {
          ctx.log.push({
            agentName: 'workflow',
            correlationId: ctx.correlationId,
            status: 'warn',
            timestamp: new Date().toISOString(),
            message: `Enkrypt gate tripped: ${evaluation.reasons.join('; ') || 'no reasons'}`,
          });
          return {
            status: 'stopped',
            stoppedAt: 'enkrypt_evaluation',
            stopReason: evaluation.reasons.join('; ') || 'enkrypt_verdict_fail',
            context: ctx,
          };
        }
      }
    } catch (error) {
      child.fail(error);
      ctx.log.push({
        agentName: `step:${step}`,
        correlationId: ctx.correlationId,
        status: 'failed',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  return { status: 'completed', context: ctx };
}

// --- Per-step execution ---------------------------------------------------

/**
 * Run a single workflow step. Exposed so callers (and tests) can
 * drive one step at a time.
 */
export async function runStep(
  step: WorkflowStepName,
  ctx: WorkflowContext,
  agents: ReturnType<typeof buildAgents>,
): Promise<unknown> {
  switch (step) {
    case 'alert_intake': {
      const out = await agents.alertIntake.run({
        alert: ctx.alert,
        receivedAt: new Date().toISOString(),
      });
      return out.normalized;
    }
    case 'classification': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      return agents.classification.run({ alert });
    }
    case 'context_retrieval': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const classification = requireState<SeverityClassification>(ctx, 'classification', step);
      return agents.contextRetrieval.run({ alert, classification });
    }
    case 'root_cause_analysis': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const classification = requireState<SeverityClassification>(ctx, 'classification', step);
      const context = requireState<RetrievedContext>(ctx, 'context_retrieval', step);
      return agents.rca.run({
        alert,
        classification,
        context,
        signals: emptySignals(),
      });
    }
    case 'resolution_recommendation': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const classification = requireState<SeverityClassification>(ctx, 'classification', step);
      const context = requireState<RetrievedContext>(ctx, 'context_retrieval', step);
      const rca = requireState<RootCauseAnalysis>(ctx, 'root_cause_analysis', step);
      return agents.resolution.run({ alert, classification, context, rca });
    }
    case 'enkrypt_evaluation': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const context = requireState<RetrievedContext>(ctx, 'context_retrieval', step);
      const resolution = requireState<ResolutionRecommendation>(
        ctx,
        'resolution_recommendation',
        step,
      );
      return evaluateWithEnkrypt({ agents, alert, context, resolution });
    }
    case 'human_approval': {
      // Placeholder: in production this step would block on a human
      // decision and return the decision once received. For the
      // foundation we record a `pending` decision and move on.
      return {
        decision: 'pending' as const,
        message:
          'Awaiting human approval. The platform never auto-deploys fixes.',
      };
    }
    case 'timeline_builder': {
      // Consolidate the step outputs into a list of timeline-shaped
      // events. The backend's TimelineService is what actually
      // persists these; the workflow just produces the shape.
      return buildTimelineEvents(ctx);
    }
    case 'post_mortem': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const classification = requireState<SeverityClassification>(ctx, 'classification', step);
      const context = requireState<RetrievedContext>(ctx, 'context_retrieval', step);
      const rca = requireState<RootCauseAnalysis>(ctx, 'root_cause_analysis', step);
      const resolution = requireState<ResolutionRecommendation>(
        ctx,
        'resolution_recommendation',
        step,
      );
      return agents.postMortem.run({ alert, classification, context, rca, resolution });
    }
    case 'learning': {
      const alert = requireState<NormalizedAlert>(ctx, 'alert_intake', step);
      const classification = requireState<SeverityClassification>(ctx, 'classification', step);
      const rca = requireState<RootCauseAnalysis>(ctx, 'root_cause_analysis', step);
      const resolution = requireState<ResolutionRecommendation>(
        ctx,
        'resolution_recommendation',
        step,
      );
      const postMortem = requireState<PostMortem>(ctx, 'post_mortem', step);
      return agents.learning.run({
        alert,
        classification,
        rca,
        resolution,
        postMortem,
      });
    }
    default: {
      const _never: never = step;
      void _never;
      throw new Error(`Unknown workflow step: ${String(step)}`);
    }
  }
}

// --- Helpers --------------------------------------------------------------

function requireState<T>(
  ctx: WorkflowContext,
  key: WorkflowStepName,
  consumer: WorkflowStepName,
): T {
  const value = ctx.state[key] as T | undefined;
  if (value === undefined) {
    throw new Error(
      `Workflow step "${consumer}" requires state from "${key}" but it is missing.`,
    );
  }
  return value;
}

function emptySignals(): RootCauseAnalysisInput['signals'] {
  return { logs: [], metrics: [], github: [] };
}

interface TimelineShape {
  correlationId: string;
  events: Array<{
    kind: string;
    actor: string | null;
    payload: unknown;
  }>;
}

function buildTimelineEvents(ctx: WorkflowContext): TimelineShape {
  const events: TimelineShape['events'] = [];
  for (const step of WORKFLOW_STEPS) {
    const value = ctx.state[step];
    if (value === undefined) continue;
    events.push({
      kind: step,
      actor: `step:${step}`,
      payload: value,
    });
  }
  return { correlationId: ctx.correlationId, events };
}

// --- Enkrypt evaluation ----------------------------------------------------

/**
 * Evaluate the resolution recommendation with Enkrypt AI. The real
 * Enkrypt client is a stub that throws "not implemented", so we
 * translate the resulting evaluation into a normalized
 * `EnkryptEvaluation` object. The workflow stops before human
 * approval when verdict is `fail`, when the agent's confidence is
 * low, or when the Enkrypt stub is unreachable (fail closed).
 */
async function evaluateWithEnkrypt(args: {
  agents: ReturnType<typeof buildAgents>;
  alert: NormalizedAlert;
  context: RetrievedContext;
  resolution: ResolutionRecommendation;
}): Promise<EnkryptEvaluation> {
  const { agents, alert, context, resolution } = args;
  const payload: EnkryptEvaluationRequest = {
    output: resolution.recommendation,
    context: { alert, context, resolution },
  };

  let raw: EnkryptEvaluationResult;
  try {
    raw = await agents.enkrypt.evaluate(payload);
  } catch (error) {
    // Fail closed: if Enkrypt is unavailable we must not let the
    // recommendation reach a human. The mock's "not implemented"
    // error is the expected case in this foundation.
    return {
      verdict: 'fail',
      hallucinationRisk: 1,
      safetyScore: 0,
      riskScore: 1,
      confidence: 0,
      reasons: [
        'Enkrypt AI evaluation is not configured (stub).',
        error instanceof Error ? error.message : String(error),
      ],
      stopBeforeApproval: true,
    };
  }

  return normalizeEnkryptResult(raw, resolution.confidence);
}

/**
 * Normalize the raw Enkrypt response into the workflow's view. The
 * decision to stop before human approval is computed here so the
 * workflow doesn't have to encode the policy.
 */
function normalizeEnkryptResult(
  raw: EnkryptEvaluationResult,
  agentConfidence: number,
): EnkryptEvaluation {
  const hallucinationRisk = clamp01(1 - raw.score);
  const safetyScore = clamp01(raw.score);
  const riskScore = clamp01(1 - raw.score);
  const confidence = clamp01(agentConfidence / 100);

  const reasons = [...raw.reasons];
  const stops: string[] = [];

  if (raw.verdict === 'fail') stops.push('enkrypt_verdict_fail');
  if (raw.verdict === 'warn') stops.push('enkrypt_verdict_warn');
  if (hallucinationRisk > 0.7) stops.push('hallucination_risk_high');
  if (confidence < 0.6) stops.push('agent_confidence_low');

  return {
    verdict: raw.verdict,
    hallucinationRisk,
    safetyScore,
    riskScore,
    confidence,
    reasons,
    stopBeforeApproval: stops.length > 0,
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
