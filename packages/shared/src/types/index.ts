// Shared TypeScript types used across apps and packages.
// Keep this file framework-agnostic. It is the single source of truth
// for the domain shape and is consumed by both the web app and Mastra.

// --- Enums (mirror Prisma enums) -------------------------------------------

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';
export type ApprovalDecision = 'pending' | 'approved' | 'rejected';

export type TimelineEventKind =
  | 'alert_received'
  | 'classification'
  | 'context_retrieved'
  | 'root_cause'
  | 'recommendation'
  | 'enkrypt_evaluation'
  | 'human_decision'
  | 'status_change'
  | 'note';

export type Environment = 'development' | 'staging' | 'production';

// --- Domain placeholders ----------------------------------------------------

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  environment: Environment;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

// --- New domain models ------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  service: string;
  environment: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  workflowRunId: string | null;
  createdById: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  kind: TimelineEventKind;
  payload: Record<string, unknown> | null;
  actor: string | null;
  correlationId: string | null;
  createdAt: string;
}

export interface Approval {
  id: string;
  incidentId: string;
  decision: ApprovalDecision;
  payload: Record<string, unknown> | null;
  decidedById: string | null;
  reason: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Observability ----------------------------------------------------------

export type LogStatus = 'started' | 'succeeded' | 'failed' | 'info' | 'warn';

export interface LogEntry {
  agentName: string;
  timestamp: string; // ISO-8601
  correlationId: string;
  status: LogStatus;
  message?: string;
  meta?: Record<string, unknown>;
}

// --- API response envelopes ------------------------------------------------

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// --- Request shapes --------------------------------------------------------

export interface CreateAlertRequest {
  title: string;
  description?: string;
  service: string;
  environment: string;
  severity?: IncidentSeverity;
  source?: string;
  // Raw alert payload preserved for the agent intake step.
  raw?: Record<string, unknown>;
}

export interface ApprovalRequest {
  reason?: string;
  decidedById?: string;
  // Free-form payload describing the recommendation being approved/rejected.
  payload?: Record<string, unknown>;
}

export interface ReplayWorkflowRequest {
  // Optional input to re-run the workflow with. If omitted, the original
  // incident data is used.
  input?: Record<string, unknown>;
}

// --- App metadata -----------------------------------------------------------

export interface AppMetadata {
  name: string;
  version: string;
  environment: Environment;
}
