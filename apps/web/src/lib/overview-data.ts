// Overview (Mission Control) data.
//
// The 5 demo incidents live in `@/lib/demo-incidents` and are
// re-exported here as `overviewIncidents` so the existing Overview
// component code keeps working without changes. The Overview uses
// only the summary fields; the Incident Workspace pulls the full
// record from the same file.

import {
  listDemoIncidentSummaries,
  type DemoIncidentSummary,
} from './demo-incidents';

export type OverviewIncident = DemoIncidentSummary;

export const overviewIncidents: OverviewIncident[] = listDemoIncidentSummaries();

// --- Below: Overview-only data (KPIs, approvals, right-column engine) ----

import type { IncidentSeverity } from '@incidentmind/shared';

export type ApprovalDecision = 'pending' | 'approved' | 'rejected';

export interface OverviewKpi {
  label: string;
  value: number;
  /** Optional pre-formatted display value (used for MTTR). */
  displayValue?: string;
  secondaryLabel: string;
  secondaryTone: 'critical' | 'high' | 'warning' | 'success' | 'info' | 'ai' | 'muted';
  /** Optional trend string (e.g. "18% lower than last week"). */
  trend?: string;
  trendTone?: 'good' | 'bad' | 'neutral';
}

export interface OverviewApproval {
  id: string;
  incidentId: string;
  incidentTitle: string;
  service: string;
  severity: IncidentSeverity;
  recommendation: string;
  rationale: string;
  initialDecision: ApprovalDecision;
  waitingSince: string;
}

export interface OverviewWorkflowStep {
  id: string;
  label: string;
  state: 'done' | 'active' | 'pending';
  detail?: string;
}

export interface OverviewInvestigation {
  incidentTitle: string;
  service: string;
  severity: IncidentSeverity;
  currentStep: string;
  confidence: number;
  estimatedSeconds: number;
  recommendationStatus: string;
  rootCause: string;
  steps: OverviewWorkflowStep[];
}

export const overviewKpis: OverviewKpi[] = [
  {
    label: 'Active Incidents',
    value: 3,
    secondaryLabel: '1 Critical · 2 High',
    secondaryTone: 'critical',
  },
  {
    label: 'Pending Approvals',
    value: 2,
    secondaryLabel: 'Oldest waiting 4 min',
    secondaryTone: 'warning',
  },
  {
    label: 'Average MTTR',
    value: 12,
    displayValue: '12 min',
    secondaryLabel: '18% lower than last week',
    secondaryTone: 'success',
    trend: '18% lower than last week',
    trendTone: 'good',
  },
  {
    label: 'Resolved Today',
    value: 27,
    secondaryLabel: '81% AI Assisted',
    secondaryTone: 'info',
  },
  {
    label: 'AI Confidence',
    value: 96,
    secondaryLabel: 'vs last week',
    secondaryTone: 'ai',
    trend: '3%',
    trendTone: 'good',
  },
];

export const overviewApprovals: OverviewApproval[] = [
  {
    id: 'apr_payment_gateway',
    incidentId: 'inc_payment_gateway_timeout_001',
    incidentTitle: 'Payment Gateway Timeout',
    service: 'payment-gateway',
    severity: 'critical',
    recommendation:
      'Roll back payment-gateway to v4.18.2, drain the 1,420 stuck transactions, and replay them against the recovered primary. Add a circuit breaker on the upstream acquirer with a 2s P99 budget.',
    rationale:
      'Five recent deploys share the same OTel trace shape; v4.18.2 is the last known-good. Confidence 96%.',
    initialDecision: 'pending',
    waitingSince: '4 min ago',
  },
  {
    id: 'apr_kafka_consumer',
    incidentId: 'inc_kafka_consumer_lag_005',
    incidentTitle: 'Kafka Consumer Lag',
    service: 'event-pipeline',
    severity: 'high',
    recommendation:
      'Scale the consumer group from 12 to 24 partitions, then enable the long-window aggregation fallback while the primary is recovered. Bump the in-flight queue budget from 5,000 to 12,000 to absorb the spike.',
    rationale:
      'Lag is concentrated in 3 of 24 partitions. Auto-scaling fires in 6 min; this buys headroom now. Confidence 91%.',
    initialDecision: 'pending',
    waitingSince: '2 min ago',
  },
];

export const overviewInvestigation: OverviewInvestigation = {
  incidentTitle: 'Payment Gateway Timeout',
  service: 'payment-gateway',
  severity: 'critical',
  currentStep: 'Root Cause Analysis',
  confidence: 96,
  estimatedSeconds: 18,
  recommendationStatus: 'Ready for Human Review',
  rootCause:
    'Upstream acquirer connection pool saturated after deploy v4.18.3 introduced a leaked JDBC handle. 1,420 transactions are stuck awaiting commit. Customer impact: ~3.4% of checkouts failing with HTTP 504.',
  steps: [
    { id: 'alert', label: 'Alert Received', state: 'done', detail: 'PagerDuty · 14:32:08 UTC' },
    { id: 'classify', label: 'Severity Classification', state: 'done', detail: 'P1 · 92% confidence' },
    { id: 'context', label: 'Context Retrieval', state: 'done', detail: '4 runbooks · 2 SOPs · 3 post-mortems' },
    {
      id: 'rca',
      label: 'Root Cause Analysis',
      state: 'active',
      detail: 'Acquirer pool exhaustion on deploy v4.18.3',
    },
    { id: 'recommendation', label: 'Recommendation', state: 'pending' },
    { id: 'approval', label: 'Human Approval', state: 'pending' },
    { id: 'resolution', label: 'Resolution', state: 'pending' },
  ],
};
