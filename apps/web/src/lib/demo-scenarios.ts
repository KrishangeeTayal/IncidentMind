// Demo scenario catalog. Each scenario walks through the full
// incident lifecycle — from alert to post-mortem — in a few seconds,
// driving the dashboard's KPIs, feed, AI panels, and severity
// distribution.

import type { Incident, IncidentSeverity, IncidentStatus } from '@incidentmind/shared';

export type DemoPhase =
  | 'idle'
  | 'alert'
  | 'classification'
  | 'context'
  | 'rca'
  | 'recommendation'
  | 'enkrypt'
  | 'awaiting_approval'
  | 'mitigation'
  | 'resolved'
  | 'postmortem'
  | 'knowledge'
  | 'complete';

export const PHASE_ORDER: DemoPhase[] = [
  'alert',
  'classification',
  'context',
  'rca',
  'recommendation',
  'enkrypt',
  'awaiting_approval',
  'mitigation',
  'resolved',
  'postmortem',
  'knowledge',
  'complete',
];

export const PHASE_LABELS: Record<DemoPhase, string> = {
  idle: 'Idle',
  alert: 'Alert received',
  classification: 'Severity classification',
  context: 'Context retrieval',
  rca: 'Root cause analysis',
  recommendation: 'Recommendation generated',
  enkrypt: 'Enkrypt safety evaluation',
  awaiting_approval: 'Awaiting human approval',
  mitigation: 'Mitigation',
  resolved: 'Resolved',
  postmortem: 'Postmortem generated',
  knowledge: 'Knowledge stored',
  complete: 'Run complete',
};

export interface DemoIncidentSeed {
  id: string;
  title: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  severity: IncidentSeverity;
  description: string;
  rootCause: string;
  recommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  evidence: string[];
  scenarioKey:
    | 'api-gateway-latency'
    | 'db-connection-pool'
    | 'redis-memory'
    | 'k8s-crashloop'
    | 'payment-timeout'
    | 'cdn-failure';
  durationSeconds: number;
}

const SCENARIOS: Record<DemoIncidentSeed['scenarioKey'], DemoIncidentSeed> = {
  'api-gateway-latency': {
    id: 'demo-api-gateway-001',
    title: 'API Gateway p99 latency exceeded SLO',
    service: 'api-gateway',
    environment: 'production',
    severity: 'high',
    description:
      'Sustained p99 latency on edge gateway above 1.2s for the past 8 minutes. Affects login + checkout paths.',
    rootCause:
      'Connection pool starvation on the upstream auth service. New instance rollout of auth-service@v2.4.1 introduced a leaked file descriptor that exhausts the pool after ~6 minutes of traffic.',
    recommendation:
      'Roll back auth-service to v2.4.0. Restart the gateway to flush stale connections. Add a 60s warm-up to the rollout plan and a connection-pool saturation alert at 80%.',
    riskLevel: 'Medium',
    confidence: 91,
    evidence: [
      'auth-service deploy v2.4.1 landed 7m before latency spike',
      'Pool saturation 100% across all gateway pods',
      'Open file descriptors climbing 1.4x post-deploy',
    ],
    scenarioKey: 'api-gateway-latency',
    durationSeconds: 36,
  },
  'db-connection-pool': {
    id: 'demo-db-pool-002',
    title: 'Postgres connection pool exhausted',
    service: 'billing-api',
    environment: 'production',
    severity: 'critical',
    description:
      '500s spiking on billing endpoints. PGBouncer reports all pools at max.',
    rootCause:
      'A new analytics job issued a long-running query that held 40 connections for 12 minutes, starving the OLTP pool.',
    recommendation:
      'Kill the analytics query. Add statement_timeout to the analytics role and route it through a dedicated read pool. Add a per-tenant connection budget.',
    riskLevel: 'High',
    confidence: 88,
    evidence: [
      'pg_stat_activity shows the offending PID holding 40 connections',
      'OLTP pool wait time climbed from 12ms to 8.4s',
      'Analytics job cron.startedAt matches the 500s window',
    ],
    scenarioKey: 'db-connection-pool',
    durationSeconds: 36,
  },
  'redis-memory': {
    id: 'demo-redis-mem-003',
    title: 'Redis maxmemory saturation on cache cluster',
    service: 'session-cache',
    environment: 'production',
    severity: 'high',
    description:
      'Eviction rate climbing to 14k keys/sec. p99 GET latency on session-cache above 28ms.',
    rootCause:
      'A misconfigured TTL on a new feature flag cache set keys to 7d, ballooning working set beyond the cluster maxmemory.',
    recommendation:
      'Drop the cache and apply the corrected 90s TTL via the feature flag config service. Raise maxmemory 25% for the next deploy window. File a follow-up to add a maxmemory forecast alert.',
    riskLevel: 'Low',
    confidence: 93,
    evidence: [
      'INFO memory shows used_memory at 96% of maxmemory',
      'Keyspace hit ratio dropped from 0.94 to 0.61',
      'New feature-flag cache key prefix discovered in SCAN sample',
    ],
    scenarioKey: 'redis-memory',
    durationSeconds: 36,
  },
  'k8s-crashloop': {
    id: 'demo-k8s-loop-004',
    title: 'Kubernetes CrashLoopBackOff on search service',
    service: 'search-service',
    environment: 'production',
    severity: 'high',
    description:
      'All replicas in CrashLoopBackOff. Search requests failing with 503 since 04:12 UTC.',
    rootCause:
      'New image tag pulled a config file from a path that does not exist in the container. Pod fails readiness probe and restarts indefinitely.',
    recommendation:
      'Pin the image to the previous tag (search-service:v3.18.2). Add a config validation step to the deploy pipeline. Add a startup probe that fails fast on missing required files.',
    riskLevel: 'Medium',
    confidence: 95,
    evidence: [
      'kubectl describe pod shows missing /etc/search/config.yaml',
      'Image SHA changed in deploy manifest 9 minutes ago',
      'Crash count matches pod restart policy exactly',
    ],
    scenarioKey: 'k8s-crashloop',
    durationSeconds: 36,
  },
  'payment-timeout': {
    id: 'demo-pay-timeout-005',
    title: 'Payment provider webhook timeouts',
    service: 'payments',
    environment: 'production',
    severity: 'critical',
    description:
      'Webhook processing for Stripe events timing out after 25s. Queue depth climbing at 400/s.',
    rootCause:
      'Downstream ledger service degraded; webhook handler waits synchronously on a downstream call that now takes 30s+.',
    recommendation:
      'Move webhook processing to an async worker with retry policy. Add a circuit breaker on the ledger client. Notify the ledger team.',
    riskLevel: 'High',
    confidence: 86,
    evidence: [
      'Webhook p99 latency climbed to 31s in the last 4 minutes',
      'Ledger service p99 reports > 25s since 03:58',
      'Stripe retry header observed on most requests',
    ],
    scenarioKey: 'payment-timeout',
    durationSeconds: 36,
  },
  'cdn-failure': {
    id: 'demo-cdn-fail-006',
    title: 'CDN edge node failures in eu-west-1',
    service: 'static-assets',
    environment: 'production',
    severity: 'medium',
    description:
      'Asset 404 rate climbing in eu-west-1. Customer-reported impact on landing pages.',
    rootCause:
      'Origin shield connection pool exhausted on the eu-west-1 edge cluster after a config push reduced pool size from 200 to 50.',
    recommendation:
      'Roll back the edge config change. Add a config-diff safety check in the CDN deploy pipeline. Add a synthetic probe for asset 404 rate per region.',
    riskLevel: 'Low',
    confidence: 89,
    evidence: [
      'Config change timestamp matches the 404 rate inflection',
      'eu-west-1 pool size in config: 50 (was 200)',
      'Other regions unaffected',
    ],
    scenarioKey: 'cdn-failure',
    durationSeconds: 36,
  },
};

export function listDemoScenarios(): DemoIncidentSeed[] {
  return Object.values(SCENARIOS);
}

export function pickDemoScenario(seed?: number): DemoIncidentSeed {
  const scenarios = listDemoScenarios();
  if (seed === undefined) {
    return scenarios[Math.floor(Math.random() * scenarios.length)]!;
  }
  return scenarios[seed % scenarios.length]!;
}

export function seedToIncident(
  seed: DemoIncidentSeed,
  status: IncidentStatus = 'open',
): Incident {
  const now = new Date();
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    service: seed.service,
    environment: seed.environment,
    severity: seed.severity,
    status,
    workflowRunId: `run_${seed.id}`,
    createdById: null,
    ownerId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
