// Agent input / output types.
//
// These types are the contracts between the agent layer and the
// workflow. They are intentionally framework-agnostic so they can be
// re-used by tests, the API layer, and the Mastra runtime.

import type { Environment } from '@incidentmind/shared';

// --- Severity & risk tiers --------------------------------------------------

export type SeverityTier = 'P1' | 'P2' | 'P3' | 'P4';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// --- 1. Alert Intake Agent --------------------------------------------------

export interface RawAlert {
  title?: unknown;
  description?: unknown;
  service?: unknown;
  environment?: unknown;
  source?: unknown;
  severity?: unknown;
  [key: string]: unknown;
}

export interface NormalizedAlert {
  title: string;
  description: string;
  service: string;
  environment: Environment;
  source: string;
  /** Stable hash of the normalized payload. */
  fingerprint: string;
  /** ISO-8601 timestamp of when the alert was received. */
  receivedAt: string;
  /** Original raw payload, preserved verbatim. */
  raw: Record<string, unknown>;
  /** Fields the agent had to fill in or correct. */
  corrections: string[];
}

export interface AlertIntakeInput {
  alert: RawAlert;
  receivedAt?: string;
}

export interface AlertIntakeOutput {
  normalized: NormalizedAlert;
}

// --- 2. Severity Classification Agent --------------------------------------

export interface SeverityClassificationInput {
  alert: NormalizedAlert;
}

export interface SeverityClassification {
  severity: SeverityTier;
  reasoning: string;
  /** 0..100 */
  confidence: number;
}

export type SeverityClassificationOutput = SeverityClassification;

// --- 3. Context Retrieval Agent --------------------------------------------

export type RetrievedContextKind = 'incident' | 'runbook' | 'sop' | 'post_mortem';

export interface RetrievedContextItem {
  kind: RetrievedContextKind;
  id: string;
  title: string;
  excerpt: string;
  /** 0..1 similarity score */
  score: number;
  source: string;
}

export interface RetrievedContext {
  similarIncidents: RetrievedContextItem[];
  runbooks: RetrievedContextItem[];
  sops: RetrievedContextItem[];
  postMortems: RetrievedContextItem[];
}

export interface ContextRetrievalInput {
  alert: NormalizedAlert;
  classification: SeverityClassification;
  /** Optional query embedding placeholder. Real vectors come from the LLM later. */
  queryVector?: number[];
}

export type ContextRetrievalOutput = RetrievedContext;

// --- 4. Root Cause Analysis Agent ------------------------------------------

export interface RCAEvidence {
  source: 'logs' | 'metrics' | 'github' | 'context' | 'alert';
  excerpt: string;
}

export interface RootCauseAnalysisInput {
  alert: NormalizedAlert;
  classification: SeverityClassification;
  context: RetrievedContext;
  /**
   * Adjacent signals the agent may consume. Each is a list of free-form
   * excerpts; the agent decides which to fold into the final answer.
   */
  signals: {
    logs: string[];
    metrics: string[];
    github: string[];
  };
}

export interface RootCauseAnalysis {
  rootCause: string;
  /** 0..100 */
  confidence: number;
  evidence: string[];
}

export type RootCauseAnalysisOutput = RootCauseAnalysis;

// --- 5. Resolution Recommendation Agent ------------------------------------

export interface ResolutionRecommendationInput {
  alert: NormalizedAlert;
  classification: SeverityClassification;
  context: RetrievedContext;
  rca: RootCauseAnalysis;
}

export interface ResolutionRecommendation {
  recommendation: string;
  riskLevel: RiskLevel;
  /** 0..100 */
  confidence: number;
}

export type ResolutionRecommendationOutput = ResolutionRecommendation;

// --- 6. Post-Mortem Agent ---------------------------------------------------

export interface PostMortemInput {
  alert: NormalizedAlert;
  classification: SeverityClassification;
  context: RetrievedContext;
  rca: RootCauseAnalysis;
  resolution: ResolutionRecommendation;
}

export interface PostMortem {
  summary: string;
  rootCause: string;
  resolution: string;
  lessonsLearned: string[];
  actionItems: string[];
}

export type PostMortemOutput = PostMortem;

// --- 7. Learning Agent -----------------------------------------------------

export interface LearningInput {
  alert: NormalizedAlert;
  classification: SeverityClassification;
  rca: RootCauseAnalysis;
  resolution: ResolutionRecommendation;
  postMortem: PostMortem;
}

export interface LearningPoint {
  /** Logical collection in Qdrant. */
  collection: 'incidents' | 'post_mortems';
  /** Stable id derived from the incident fingerprint. */
  pointId: string;
  /** Free-form payload that Qdrant will index alongside the vector. */
  payload: Record<string, unknown>;
}

export interface LearningOutput {
  points: LearningPoint[];
}

// --- Enkrypt evaluation (workflow-level) -----------------------------------

export interface EnkryptEvaluation {
  /** Final verdict from Enkrypt. */
  verdict: 'pass' | 'warn' | 'fail';
  /** 0..1, higher = more likely the agent output is hallucinated. */
  hallucinationRisk: number;
  /** 0..1, higher = safer. */
  safetyScore: number;
  /** 0..1, higher = riskier action. */
  riskScore: number;
  /** 0..1, mirror of the agent's self-reported confidence normalized to 0..1. */
  confidence: number;
  reasons: string[];
  /** True when the workflow must stop before human approval. */
  stopBeforeApproval: boolean;
}

export interface EnkryptEvaluationInput {
  output: string;
  resolution: ResolutionRecommendation;
  context: RetrievedContext;
  alert: NormalizedAlert;
}
