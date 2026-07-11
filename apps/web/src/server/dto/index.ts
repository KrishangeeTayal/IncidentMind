// Mappers that translate Prisma models into the framework-agnostic
// shared types exposed by `@incidentmind/shared`. Keeping this layer
// thin means the rest of the app never imports Prisma types directly.

import type {
  Approval as SharedApproval,
  Incident as SharedIncident,
  TimelineEvent as SharedTimelineEvent,
  User as SharedUser,
  IncidentSeverity,
  IncidentStatus,
  ApprovalDecision,
  TimelineEventKind,
} from '@incidentmind/shared';

type PrismaSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type PrismaStatus = 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
type PrismaDecision = 'PENDING' | 'APPROVED' | 'REJECTED';
type PrismaKind =
  | 'ALERT_RECEIVED'
  | 'CLASSIFICATION'
  | 'CONTEXT_RETRIEVED'
  | 'ROOT_CAUSE'
  | 'RECOMMENDATION'
  | 'ENKRYPT_EVALUATION'
  | 'HUMAN_DECISION'
  | 'STATUS_CHANGE'
  | 'NOTE';

export function toIncidentSeverity(value: PrismaSeverity): IncidentSeverity {
  const map: Record<PrismaSeverity, IncidentSeverity> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  };
  return map[value];
}

export function toIncidentStatus(value: PrismaStatus): IncidentStatus {
  const map: Record<PrismaStatus, IncidentStatus> = {
    OPEN: 'open',
    INVESTIGATING: 'investigating',
    MITIGATED: 'mitigated',
    RESOLVED: 'resolved',
  };
  return map[value];
}

export function toApprovalDecision(value: PrismaDecision): ApprovalDecision {
  const map: Record<PrismaDecision, ApprovalDecision> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  };
  return map[value];
}

export function toTimelineEventKind(value: PrismaKind): TimelineEventKind {
  const map: Record<PrismaKind, TimelineEventKind> = {
    ALERT_RECEIVED: 'alert_received',
    CLASSIFICATION: 'classification',
    CONTEXT_RETRIEVED: 'context_retrieved',
    ROOT_CAUSE: 'root_cause',
    RECOMMENDATION: 'recommendation',
    ENKRYPT_EVALUATION: 'enkrypt_evaluation',
    HUMAN_DECISION: 'human_decision',
    STATUS_CHANGE: 'status_change',
    NOTE: 'note',
  };
  return map[value];
}

interface PrismaUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapUser(u: PrismaUser): SharedUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

interface PrismaIncident {
  id: string;
  title: string;
  description: string | null;
  service: string;
  environment: string;
  severity: PrismaSeverity;
  status: PrismaStatus;
  workflowRunId: string | null;
  createdById: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapIncident(i: PrismaIncident): SharedIncident {
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    service: i.service,
    environment: i.environment,
    severity: toIncidentSeverity(i.severity),
    status: toIncidentStatus(i.status),
    workflowRunId: i.workflowRunId,
    createdById: i.createdById,
    ownerId: i.ownerId,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

interface PrismaTimelineEvent {
  id: string;
  incidentId: string;
  kind: PrismaKind;
  payload: unknown;
  actor: string | null;
  correlationId: string | null;
  createdAt: Date;
}

export function mapTimelineEvent(e: PrismaTimelineEvent): SharedTimelineEvent {
  return {
    id: e.id,
    incidentId: e.incidentId,
    kind: toTimelineEventKind(e.kind),
    payload: isPlainObject(e.payload) ? e.payload : null,
    actor: e.actor,
    correlationId: e.correlationId,
    createdAt: e.createdAt.toISOString(),
  };
}

interface PrismaApproval {
  id: string;
  incidentId: string;
  decision: PrismaDecision;
  payload: unknown;
  decidedById: string | null;
  reason: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapApproval(a: PrismaApproval): SharedApproval {
  return {
    id: a.id,
    incidentId: a.incidentId,
    decision: toApprovalDecision(a.decision),
    payload: isPlainObject(a.payload) ? a.payload : null,
    decidedById: a.decidedById,
    reason: a.reason,
    decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
