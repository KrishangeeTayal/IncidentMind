// Map domain enums onto the shadcn-style Badge variants.

import type { IncidentSeverity, IncidentStatus, ApprovalDecision, TimelineEventKind } from '@incidentmind/shared';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const SEVERITY_VARIANT: Record<
  IncidentSeverity,
  'low' | 'medium' | 'high' | 'critical'
> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

export function IncidentSeverityBadge({
  severity,
  className,
}: {
  severity: IncidentSeverity;
  className?: string;
}): JSX.Element {
  return (
    <Badge variant={SEVERITY_VARIANT[severity]} className={cn('uppercase', className)}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  mitigated: 'Mitigated',
  resolved: 'Resolved',
};

const STATUS_VARIANT: Record<IncidentStatus, 'destructive' | 'warning' | 'info' | 'success'> = {
  open: 'destructive',
  investigating: 'warning',
  mitigated: 'info',
  resolved: 'success',
};

export function IncidentStatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}): JSX.Element {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn('uppercase', className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const APPROVAL_VARIANT: Record<ApprovalDecision, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export function ApprovalBadge({
  decision,
  className,
}: {
  decision: ApprovalDecision;
  className?: string;
}): JSX.Element {
  return (
    <Badge variant={APPROVAL_VARIANT[decision]} className={cn('uppercase', className)}>
      {decision}
    </Badge>
  );
}

const TIMELINE_LABELS: Record<TimelineEventKind, string> = {
  alert_received: 'Alert received',
  classification: 'Severity classified',
  context_retrieved: 'Context retrieved',
  root_cause: 'Root cause identified',
  recommendation: 'Recommendation generated',
  enkrypt_evaluation: 'Enkrypt evaluation',
  human_decision: 'Human decision',
  status_change: 'Status change',
  note: 'Note',
};

export function timelineLabel(kind: TimelineEventKind): string {
  return TIMELINE_LABELS[kind];
}
