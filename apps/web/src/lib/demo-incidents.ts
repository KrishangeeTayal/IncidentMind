// Single source of truth for demo incidents.
//
// Both the Overview (Mission Control) page and the Incident Workspace
// read from this file so the data is never duplicated. The Overview
// imports the `summary` slice, the Workspace imports the full record.

import type {
  IncidentSeverity,
  IncidentStatus,
} from '@incidentmind/shared';

// --- Public summary shape (also re-exported as `OverviewIncident`) -------

export interface DemoIncidentSummary {
  id: string;
  title: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  severity: IncidentSeverity;
  status: IncidentStatus;
  /** AI confidence 0..100, or null when not under AI investigation. */
  aiConfidence: number | null;
  /** ISO-8601 timestamp the incident was opened. */
  startedAt: string;
  /** Short, human-readable description. */
  description: string;
  /** Short anchor like "4 min ago" — kept for the Overview card. */
  timeLabel: string;
  /** Seconds since the incident was opened (for live tick on the Overview). */
  secondsAgo: number;
}

// --- Workspace shapes ------------------------------------------------------

export type TimelineStepState = 'done' | 'active' | 'pending';

export interface TimelineStep {
  id: 'alert' | 'classify' | 'context' | 'rca' | 'recommendation' | 'approval' | 'resolution';
  label: string;
  state: TimelineStepState;
  startedAt?: string;
  completedAt?: string;
  /** Bullet points revealed when the step is expanded. */
  details: string[];
  /** Section id this step scrolls to when clicked. */
  scrollTarget?: string;
}

export interface EvidenceMetric {
  label: string;
  value: string;
  tone: 'critical' | 'warning' | 'info' | 'success';
  /** Optional helper sub-label, e.g. "↑ 12x baseline". */
  hint?: string;
}

export interface LogEntry {
  timestamp: string; // HH:MM:SS
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  source: string;
  message: string;
}

export interface DeploymentEntry {
  timestamp: string; // HH:MM
  version: string;
  service: string;
  author: string;
  status: 'deployed' | 'rolled-back' | 'in-progress';
}

export interface TraceEntry {
  id: string;
  duration: string;
  method: string;
  endpoint: string;
  pod: string;
  status: 'timeout' | 'error' | 'ok';
}

export interface EvidenceBundle {
  metrics: EvidenceMetric[];
  logs: LogEntry[];
  deployments: DeploymentEntry[];
  traces: TraceEntry[];
}

export interface AIReasoning {
  observation: string;
  supportingEvidence: string[];
  confidence: number;
  why: string;
}

export interface SimilarIncident {
  id: string;
  title: string;
  date: string; // e.g. "2026-05-12"
  /** Similarity score 0..1 */
  similarity: number;
  /** Time to resolve, in minutes. */
  resolutionTimeMinutes: number;
  summary: string;
  rootCause: string;
  resolution: string;
  lessonsLearned: string[];
}

export interface Recommendation {
  title: string;
  estimatedRecovery: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  steps: string[];
}

export interface EnkryptSafety {
  safetyScore: number; // 0..100
  hallucinationRisk: number; // 0..100
  evidenceCoverage: number; // 0..100
  decision: string; // e.g. "Safe for Human Review"
  /** Optional short note (e.g. "All evidence from production traces"). */
  note?: string;
}

export interface DemoIncident {
  summary: DemoIncidentSummary;
  timeline: TimelineStep[];
  evidence: EvidenceBundle;
  reasoning: AIReasoning;
  similarIncidents: SimilarIncident[];
  recommendation: Recommendation;
  enkrypt: EnkryptSafety;
}

// --- Demo data -------------------------------------------------------------

const PAYMENT_GATEWAY: DemoIncident = {
  summary: {
    id: 'inc_payment_gateway_timeout_001',
    title: 'Payment Gateway Timeout',
    service: 'payment-gateway',
    environment: 'production',
    severity: 'critical',
    status: 'open',
    aiConfidence: 96,
    startedAt: '2026-07-10T14:32:08Z',
    description:
      'Acquirer connection pool exhausted on payment-gateway after deploy v4.18.3 introduced a leaked JDBC handle. 1,420 transactions are stuck awaiting commit. Customer impact: ~3.4% of checkouts failing with HTTP 504.',
    timeLabel: '4 min ago',
    secondsAgo: 240,
  },
  timeline: [
    {
      id: 'alert',
      label: 'Alert Received',
      state: 'done',
      startedAt: '14:32:08',
      completedAt: '14:32:09',
      details: [
        'PagerDuty service `payment-gateway-prod` opened a P1 incident.',
        'Trigger: HTTP 504 rate exceeded 2% over a 5-minute window.',
        'First symptom reported by 3 customers in the checkout flow.',
      ],
      scrollTarget: 'section-evidence',
    },
    {
      id: 'classify',
      label: 'Severity Classification',
      state: 'done',
      startedAt: '14:32:10',
      completedAt: '14:32:12',
      details: [
        'Classified as P1 (Critical) with 92% confidence.',
        'Reason: customer-impacting outage, revenue at risk.',
        'Affected services: payment-gateway, payment-worker, billing-api, session-cache.',
      ],
      scrollTarget: 'section-evidence',
    },
    {
      id: 'context',
      label: 'Context Retrieval',
      state: 'done',
      startedAt: '14:32:12',
      completedAt: '14:32:14',
      details: [
        'Retrieved 4 similar incidents from the last 90 days.',
        'Matched 3 runbooks and 2 SOPs for payment-gateway.',
        'Pulled 1 post-mortem from a related 2026-05 incident.',
      ],
      scrollTarget: 'section-evidence',
    },
    {
      id: 'rca',
      label: 'Root Cause Analysis',
      state: 'active',
      startedAt: '14:32:14',
      details: [
        'Acquirer connection pool saturated on payment-worker-3.',
        'Deploy v4.18.3 introduced a leaked JDBC handle; pool drops from 40 → 0 over 4 minutes.',
        '1,420 transactions are stuck in `awaiting commit` state.',
        'Cross-referenced with runbook RB-014 and SOP-S03.',
      ],
      scrollTarget: 'section-reasoning',
    },
    {
      id: 'recommendation',
      label: 'Recommendation',
      state: 'pending',
      details: ['Generated a remediation plan with risk = Low.'],
      scrollTarget: 'section-recommendation',
    },
    {
      id: 'approval',
      label: 'Human Approval',
      state: 'pending',
      details: ['Awaiting a human reviewer. The system will not auto-deploy.'],
      scrollTarget: 'section-recommendation',
    },
    {
      id: 'resolution',
      label: 'Resolution',
      state: 'pending',
      details: ['Runbook RB-014 will be executed on approval.'],
      scrollTarget: 'section-resolution',
    },
  ],
  evidence: {
    metrics: [
      { label: 'Latency', value: '1850 ms', tone: 'critical', hint: '↑ 12x baseline (150 ms)' },
      { label: 'Error Rate', value: '18%', tone: 'critical', hint: '↑ 30x baseline (0.6%)' },
      { label: 'Memory', value: '94%', tone: 'warning', hint: 'Fragmentation suspected' },
      { label: 'Affected Services', value: '4', tone: 'info', hint: 'payment-gateway, payment-worker, billing-api, session-cache' },
    ],
    logs: [
      { timestamp: '14:32:08', level: 'ERROR', source: 'payment-worker-3', message: 'Connection timeout acquiring DB connection (took 30s)' },
      { timestamp: '14:32:05', level: 'ERROR', source: 'payment-gateway', message: 'Upstream timeout (acquirer): 30s — circuit breaker tripped' },
      { timestamp: '14:32:01', level: 'WARN', source: 'payment-worker-2', message: 'DB connection pool at 95% (38/40)' },
      { timestamp: '14:31:55', level: 'INFO', source: 'payment-worker-1', message: 'Health check passed' },
      { timestamp: '14:31:48', level: 'INFO', source: 'deploy-bot', message: 'Rollout payment-worker:v4.18.3 — 12/12 pods updated' },
    ],
    deployments: [
      { timestamp: '14:28', version: 'payment-worker:v4.18.3', service: 'payment-worker', author: 'alice@incidentmind.dev', status: 'deployed' },
      { timestamp: '14:15', version: 'payment-gateway:v2.6.0', service: 'payment-gateway', author: 'bob@incidentmind.dev', status: 'deployed' },
      { timestamp: '13:42', version: 'session-cache:v1.9.1', service: 'session-cache', author: 'alice@incidentmind.dev', status: 'deployed' },
    ],
    traces: [
      { id: 'trace_abc123', duration: '30.0s', method: 'POST', endpoint: '/api/v1/charge', pod: 'payment-worker-3', status: 'timeout' },
      { id: 'trace_def456', duration: '28.4s', method: 'POST', endpoint: '/api/v1/auth', pod: 'payment-gateway', status: 'error' },
      { id: 'trace_ghi789', duration: '0.8s', method: 'GET', endpoint: '/api/v1/balance', pod: 'payment-worker-1', status: 'ok' },
    ],
  },
  reasoning: {
    observation:
      'DB connection pool exhausted on payment-worker-3 after deploy v4.18.3. Pool utilization spiked from 12% to 95% within 4 minutes.',
    supportingEvidence: [
      'Pool at 38/40 connections — p99 latency 30s',
      'Deploy v4.18.3 introduced a new connection handle that is never closed on error paths',
      '1,420 transactions stuck in awaiting commit for > 30s',
      '3 of 3 erroring pods share the same image SHA (v4.18.3)',
    ],
    confidence: 96,
    why: 'Pool exhaustion is the only signal that changed sharply post-deploy. The 4-minute window from deploy to saturation matches the rate at which the new code path opens unclosed handles. No other deploys in the window correlate with the symptom timing.',
  },
  similarIncidents: [
    {
      id: 'sim_checkout_5xx_may',
      title: 'Checkout 5xx surge',
      date: '2026-05-12',
      similarity: 0.92,
      resolutionTimeMinutes: 14,
      summary:
        'Checkout API returned 5xx for 12 minutes after a deploy introduced a stale cache key.',
      rootCause: 'Stale cache key after deploy invalidated the session lookup path.',
      resolution: 'Rolled back to the previous release; added a cache invalidation step to the deploy pipeline.',
      lessonsLearned: [
        'Cache keys must be versioned with the service version.',
        'Deploys should include a warm-up step for cache priming.',
        'Synthetic checkout monitor would have caught this 2 minutes earlier.',
      ],
    },
    {
      id: 'sim_auth_leak_apr',
      title: 'Auth service connection leak',
      date: '2026-04-28',
      similarity: 0.87,
      resolutionTimeMinutes: 22,
      summary:
        'Auth service gradually exhausted its connection pool over 18 minutes after a refactor.',
      rootCause: 'Refactor removed a `defer db.Close()` in an error-handling branch.',
      resolution: 'Restored the close call; added a linter rule to flag missing `defer Close()` on `*sql.DB`.',
      lessonsLearned: [
        'Linters can catch entire bug classes when configured per-pattern.',
        'Connection pool metrics should page on saturation > 80%.',
        'Forced code review on `database/sql` files for two weeks.',
      ],
    },
    {
      id: 'sim_retry_storm_mar',
      title: 'Payment retry storm',
      date: '2026-03-15',
      similarity: 0.81,
      resolutionTimeMinutes: 31,
      summary:
        'A payment provider timeout triggered unbounded retries, multiplying the load 14x.',
      rootCause: 'Retry policy had no max-attempts cap and no exponential backoff.',
      resolution: 'Added a circuit breaker and capped retries at 3 with backoff.',
      lessonsLearned: [
        'Every external call needs a retry budget.',
        'Circuit breakers belong in the default client SDK, not opt-in.',
        'Add load test that simulates 5% upstream failure for retry storms.',
      ],
    },
  ],
  recommendation: {
    title: 'Restart payment-worker pods.',
    estimatedRecovery: '4 minutes',
    risk: 'Low',
    reason: 'Memory fragmentation detected. A rolling restart drops the leaked handles and drains stuck transactions without customer-visible errors.',
    steps: [
      'kubectl rollout restart deployment/payment-worker',
      'Verify DB pool utilization drops below 50% within 90 seconds',
      'Replay the 1,420 stuck transactions from the dead-letter queue',
      'Open a follow-up to add a connection-handle leak detector to the deploy pipeline',
    ],
  },
  enkrypt: {
    safetyScore: 94,
    hallucinationRisk: 8,
    evidenceCoverage: 91,
    decision: 'Safe for Human Review',
    note: 'All evidence sourced from production traces and deploy history.',
  },
};

const REDIS_MEMORY: DemoIncident = {
  summary: {
    id: 'inc_redis_memory_saturation_002',
    title: 'Redis Memory Saturation',
    service: 'session-cache',
    environment: 'production',
    severity: 'high',
    status: 'investigating',
    aiConfidence: 87,
    startedAt: '2026-07-10T14:20:00Z',
    description:
      'Working set exceeded `maxmemory` on the session-cache cluster. Eviction rate climbing to 14k keys/sec; hit ratio dropped from 0.94 to 0.61.',
    timeLabel: '12 min ago',
    secondsAgo: 720,
  },
  timeline: [
    {
      id: 'alert',
      label: 'Alert Received',
      state: 'done',
      startedAt: '14:20:00',
      completedAt: '14:20:02',
      details: [
        'Triggered by `redis_maxmemory_used_ratio > 0.9`.',
        'First alert ack by on-call within 90 seconds.',
      ],
    },
    {
      id: 'classify',
      label: 'Severity Classification',
      state: 'done',
      startedAt: '14:20:02',
      completedAt: '14:20:04',
      details: ['P2 (High) — degrades user experience, but not an outage.'],
    },
    {
      id: 'context',
      label: 'Context Retrieval',
      state: 'done',
      startedAt: '14:20:04',
      completedAt: '14:20:06',
      details: [
        '2 similar incidents in the last 6 months.',
        'Runbook RB-021 (Redis memory) and SOP-S11 (cache TTL audit).',
      ],
    },
    {
      id: 'rca',
      label: 'Root Cause Analysis',
      state: 'done',
      startedAt: '14:20:06',
      completedAt: '14:20:30',
      details: [
        'New feature-flag cache introduced keys with a 7-day TTL (config bug).',
        'Working set grew from 4.2 GB to 9.6 GB in 11 minutes.',
        'Hit ratio collapsed once evictions exceeded reads.',
      ],
      scrollTarget: 'section-reasoning',
    },
    {
      id: 'recommendation',
      label: 'Recommendation',
      state: 'done',
      startedAt: '14:20:30',
      completedAt: '14:20:45',
      details: ['Generated plan: drop the cache, apply the corrected 90s TTL.'],
      scrollTarget: 'section-recommendation',
    },
    {
      id: 'approval',
      label: 'Human Approval',
      state: 'active',
      details: ['Awaiting a human reviewer to apply the corrected config.'],
      scrollTarget: 'section-recommendation',
    },
    {
      id: 'resolution',
      label: 'Resolution',
      state: 'pending',
      details: ['Config push will run on approval.'],
      scrollTarget: 'section-resolution',
    },
  ],
  evidence: {
    metrics: [
      { label: 'Latency', value: '28 ms', tone: 'warning', hint: '↑ 9x baseline (3 ms)' },
      { label: 'Error Rate', value: '2.1%', tone: 'warning', hint: 'cache misses failing over' },
      { label: 'Memory', value: '96%', tone: 'critical', hint: 'eviction rate 14k/s' },
      { label: 'Affected Services', value: '2', tone: 'info', hint: 'session-cache, auth-api' },
    ],
    logs: [
      { timestamp: '14:20:00', level: 'WARN', source: 'redis-node-2', message: 'maxmemory eviction rate exceeded 10k keys/sec' },
      { timestamp: '14:19:55', level: 'WARN', source: 'session-cache', message: 'cache hit ratio dropped below 0.7' },
      { timestamp: '14:19:42', level: 'INFO', source: 'feature-flag-svc', message: 'flag checkout_v2 enabled, cache namespace initialized' },
    ],
    deployments: [
      { timestamp: '14:18', version: 'session-cache:v3.4.0', service: 'session-cache', author: 'carol@incidentmind.dev', status: 'deployed' },
      { timestamp: '13:55', version: 'auth-api:v1.12.4', service: 'auth-api', author: 'dan@incidentmind.dev', status: 'deployed' },
    ],
    traces: [
      { id: 'trace_xyz111', duration: '0.028s', method: 'GET', endpoint: '/session/:id', pod: 'session-cache-2', status: 'ok' },
      { id: 'trace_xyz222', duration: '0.142s', method: 'GET', endpoint: '/session/:id', pod: 'session-cache-1', status: 'error' },
    ],
  },
  reasoning: {
    observation:
      'A new feature flag namespace introduced cache keys with a 7-day TTL, ballooning the working set past `maxmemory`.',
    supportingEvidence: [
      'Keyspace scan found 4.1M keys under `ff:checkout_v2:*`',
      'TTL histogram for that prefix is concentrated at 604800s (7 days)',
      'Eviction rate vs. read rate flipped at 14:19 — read rate constant, eviction spiked',
    ],
    confidence: 87,
    why: 'The TTL distribution is the smoking gun: a single prefix with an outlier TTL and a step-function growth in working set, both starting at the same minute the flag was enabled.',
  },
  similarIncidents: [
    {
      id: 'sim_cache_storm_jan',
      title: 'Cache stampede after deploy',
      date: '2026-01-22',
      similarity: 0.84,
      resolutionTimeMinutes: 19,
      summary: 'Cache was wiped on deploy, causing a thundering herd to the database.',
      rootCause: 'Deploy ran `FLUSHDB` by mistake in the startup script.',
      resolution: 'Removed the FLUSHDB; added a pre-deploy cache warm-up step.',
      lessonsLearned: [
        'Never `FLUSHDB` from a startup script.',
        'Cache warm-up belongs in the deploy pipeline.',
        'Stampede protection (single-flight) should be default on cache misses.',
      ],
    },
    {
      id: 'sim_keyspace_growth_nov',
      title: 'Unbounded key growth in feature cache',
      date: '2025-11-04',
      similarity: 0.79,
      resolutionTimeMinutes: 12,
      summary: 'A new feature flag cache had no TTL — keys accumulated for months.',
      rootCause: 'TTL was set to 0 (no expiry) in the cache helper.',
      resolution: 'Added a default 24h TTL to the cache helper; ran a cleanup job.',
      lessonsLearned: [
        'Defaults should always expire.',
        'Cache helper should warn on TTL=0 in non-test environments.',
        'Quarterly cache audit is now part of the platform health check.',
      ],
    },
    {
      id: 'sim_eviction_loop_sep',
      title: 'Eviction loop on small Redis cluster',
      date: '2025-09-18',
      similarity: 0.74,
      resolutionTimeMinutes: 27,
      summary: 'A 3-node cluster spent 80% of CPU evicting keys because of a mis-sized maxmemory.',
      rootCause: 'maxmemory was set to 256 MB on a node with 4 GB physical memory.',
      resolution: 'Right-sized maxmemory to 2 GB; added a provisioning lint.',
      lessonsLearned: [
        'Provision linting should flag under-sized maxmemory.',
        'Memory pressure metrics should be on the platform dashboard.',
        'Read/write ratio matters as much as absolute memory.',
      ],
    },
  ],
  recommendation: {
    title: 'Drop the cache and apply the corrected 90s TTL.',
    estimatedRecovery: '6 minutes',
    risk: 'Low',
    reason: 'Cache is recoverable; downstream services have a stale-tolerance of 90s. A wipe + config push resolves the saturation immediately.',
    steps: [
      'Push the corrected 90s TTL via the feature-flag config service',
      'Run a controlled `SCAN` + `DEL` against the `ff:checkout_v2:*` prefix',
      'Raise `maxmemory` by 25% for the next deploy window',
      'Add a maxmemory forecast alert to the platform dashboard',
    ],
  },
  enkrypt: {
    safetyScore: 91,
    hallucinationRisk: 11,
    evidenceCoverage: 84,
    decision: 'Safe for Human Review',
    note: 'One supporting signal is from a non-production telemetry source — flagged in the audit trail.',
  },
};

const DB_CONNECTION_POOL: DemoIncident = {
  summary: {
    id: 'inc_db_connection_pool_003',
    title: 'Database Connection Pool Exhaustion',
    service: 'billing-api',
    environment: 'production',
    severity: 'medium',
    status: 'resolved',
    aiConfidence: 92,
    startedAt: '2026-07-10T14:07:00Z',
    description:
      'OLTP connection pool on billing-api exhausted by a long-running analytics query. Customers saw 500s for 8 minutes before the query was killed.',
    timeLabel: '25 min ago',
    secondsAgo: 1500,
  },
  timeline: [
    { id: 'alert', label: 'Alert Received', state: 'done', startedAt: '14:07', completedAt: '14:07:02', details: ['Trigger: 500 rate exceeded 5% for 3 minutes on billing-api.'] },
    { id: 'classify', label: 'Severity Classification', state: 'done', startedAt: '14:07:02', completedAt: '14:07:04', details: ['P3 (Medium) — partial degradation, no data loss.'] },
    { id: 'context', label: 'Context Retrieval', state: 'done', startedAt: '14:07:04', completedAt: '14:07:06', details: ['Runbook RB-007 (Pool exhaustion), postmortem PM-2026-04.'] },
    { id: 'rca', label: 'Root Cause Analysis', state: 'done', startedAt: '14:07:06', completedAt: '14:12', details: ['A nightly analytics job ran during peak. It held 38 connections for 11 minutes, starving the OLTP pool.'] },
    { id: 'recommendation', label: 'Recommendation', state: 'done', startedAt: '14:12', completedAt: '14:13', details: ['Generated plan to kill the query, add statement_timeout, route analytics through a dedicated read pool.'] },
    { id: 'approval', label: 'Human Approval', state: 'done', startedAt: '14:13', completedAt: '14:14', details: ['Approved by on-call: Maya Chen.'] },
    { id: 'resolution', label: 'Resolution', state: 'done', startedAt: '14:14', completedAt: '14:15', details: ['Query killed, pool recovered, customer impact ended at 14:15. Postmortem in progress.'] },
  ],
  evidence: {
    metrics: [
      { label: 'Latency', value: '4.2 s', tone: 'warning', hint: '↑ 8x baseline (520 ms)' },
      { label: 'Error Rate', value: '6%', tone: 'warning', hint: '500s during the 8-minute window' },
      { label: 'Memory', value: '71%', tone: 'info', hint: 'within nominal range' },
      { label: 'Affected Services', value: '1', tone: 'info', hint: 'billing-api only' },
    ],
    logs: [
      { timestamp: '14:14:22', level: 'INFO', source: 'on-call', message: 'Killed PID 18472 — analytics query against billing.events' },
      { timestamp: '14:12:08', level: 'WARN', source: 'pgbouncer', message: 'OLTP pool at 38/40 — 6s wait' },
      { timestamp: '14:07:14', level: 'ERROR', source: 'billing-api', message: 'pool timeout: 5s exceeded' },
    ],
    deployments: [
      { timestamp: '13:30', version: 'analytics-job:v2.1.0', service: 'analytics', author: 'erin@incidentmind.dev', status: 'deployed' },
      { timestamp: '13:10', version: 'billing-api:v5.4.1', service: 'billing-api', author: 'frank@incidentmind.dev', status: 'deployed' },
    ],
    traces: [
      { id: 'trace_dbp_001', duration: '6.0s', method: 'GET', endpoint: '/billing/invoices', pod: 'billing-api-2', status: 'error' },
      { id: 'trace_dbp_002', duration: '11.0s', method: 'POST', endpoint: '/analytics/run', pod: 'analytics-1', status: 'ok' },
    ],
  },
  reasoning: {
    observation:
      'A scheduled analytics job held 38 of 40 OLTP connections for 11 minutes during peak, causing pool exhaustion on billing-api.',
    supportingEvidence: [
      'pg_stat_activity shows PID 18472 holding 38 connections since 14:02',
      'Analytics job cron started at 14:02 — 5 minutes before the first 500',
      'Other OLTP queries waited 6+ seconds in pgbouncer queue',
    ],
    confidence: 92,
    why: 'The query timing and the connection count together uniquely identify the offending job. No other workloads were active that could have consumed 38 connections.',
  },
  similarIncidents: [
    {
      id: 'sim_analytics_job_feb',
      title: 'Analytics job blocked OLTP',
      date: '2026-02-09',
      similarity: 0.88,
      resolutionTimeMinutes: 11,
      summary: 'A new analytics query ran during business hours and exhausted the OLTP pool.',
      rootCause: 'Cron schedule was set to `0 14 * * *` instead of `0 4 * * *`.',
      resolution: 'Fixed the schedule; routed analytics through the read pool.',
      lessonsLearned: [
        'Cron schedules need a code review lint for off-hours defaults.',
        'Analytics queries should run on a dedicated role with a connection cap.',
        'Add a query-level timeout to the analytics role.',
      ],
    },
    {
      id: 'sim_pool_saturation_dec',
      title: 'OLTP pool saturation under load',
      date: '2025-12-14',
      similarity: 0.76,
      resolutionTimeMinutes: 16,
      summary: 'Black Friday traffic exhausted the OLTP pool even with auto-scaling.',
      rootCause: 'Auto-scaler was capped at 8 pods; we needed 12.',
      resolution: 'Raised the cap; added predictive scaling for known peak windows.',
      lessonsLearned: [
        'Auto-scaler caps should be reviewed before every known peak.',
        'Predictive scaling for recurring events > reactive scaling.',
        'Pool size must scale with replica count.',
      ],
    },
    {
      id: 'sim_silent_connection_leak',
      title: 'Silent connection leak in worker',
      date: '2025-10-02',
      similarity: 0.71,
      resolutionTimeMinutes: 24,
      summary: 'A background worker leaked DB connections over 6 hours until the pool was empty.',
      rootCause: 'Worker held a transaction open across a network call without a defer.',
      resolution: 'Restructured the worker to release the connection between calls; added a saturation alert.',
      lessonsLearned: [
        'Transactions should not span I/O.',
        'Pool saturation is a leading indicator of leaks.',
        'Worker code needs the same review rigor as request handlers.',
      ],
    },
  ],
  recommendation: {
    title: 'Kill the analytics query and add a statement_timeout.',
    estimatedRecovery: '2 minutes',
    risk: 'Low',
    reason: 'The query is identifiable, killable, and the fix is local. A statement_timeout prevents recurrence.',
    steps: [
      'pg_terminate_backend(PID 18472)',
      'Add `statement_timeout = 60s` to the analytics role',
      'Route analytics queries through a dedicated read pool',
      'Block analytics schedules from running during business hours',
    ],
  },
  enkrypt: {
    safetyScore: 96,
    hallucinationRisk: 5,
    evidenceCoverage: 93,
    decision: 'Safe for Human Review',
  },
};

const CDN_LATENCY: DemoIncident = {
  summary: {
    id: 'inc_cdn_latency_spike_004',
    title: 'CDN Latency Spike',
    service: 'static-assets',
    environment: 'production',
    severity: 'low',
    status: 'open',
    aiConfidence: 78,
    startedAt: '2026-07-10T14:24:00Z',
    description:
      'Asset 404 rate climbing in eu-west-1 after a config push reduced the origin-shield pool size from 200 to 50.',
    timeLabel: '8 min ago',
    secondsAgo: 480,
  },
  timeline: [
    { id: 'alert', label: 'Alert Received', state: 'done', startedAt: '14:24', completedAt: '14:24:02', details: ['Trigger: 404 rate > 1% for static assets in eu-west-1.'] },
    { id: 'classify', label: 'Severity Classification', state: 'done', startedAt: '14:24:02', completedAt: '14:24:04', details: ['P4 (Low) — no customer-visible impact reported.'] },
    { id: 'context', label: 'Context Retrieval', state: 'done', startedAt: '14:24:04', completedAt: '14:24:06', details: ['Runbook RB-031 (CDN config), 1 similar incident in the last 12 months.'] },
    { id: 'rca', label: 'Root Cause Analysis', state: 'active', details: ['A config change reduced the origin-shield connection pool from 200 to 50 on the eu-west-1 edge cluster.'] },
    { id: 'recommendation', label: 'Recommendation', state: 'pending', details: ['Roll back the config change.'] },
    { id: 'approval', label: 'Human Approval', state: 'pending', details: ['Awaiting reviewer.'] },
    { id: 'resolution', label: 'Resolution', state: 'pending', details: ['Pending approval.'] },
  ],
  evidence: {
    metrics: [
      { label: 'Latency', value: '420 ms', tone: 'info', hint: '↑ 3x baseline (140 ms)' },
      { label: 'Error Rate', value: '0.8%', tone: 'info', hint: '404s, all in eu-west-1' },
      { label: 'Memory', value: '54%', tone: 'info', hint: 'within nominal range' },
      { label: 'Affected Services', value: '1', tone: 'info', hint: 'static-assets (eu-west-1 only)' },
    ],
    logs: [
      { timestamp: '14:24:11', level: 'WARN', source: 'cdn-edge-eu-1', message: 'origin-shield pool at 50/50 — 404s climbing' },
      { timestamp: '14:24:02', level: 'INFO', source: 'cdn-deploy', message: 'config diff applied: shield_pool_size 200 → 50' },
    ],
    deployments: [
      { timestamp: '14:23', version: 'cdn-config:v8.2.0', service: 'static-assets', author: 'grace@incidentmind.dev', status: 'deployed' },
    ],
    traces: [
      { id: 'trace_cdn_001', duration: '0.42s', method: 'GET', endpoint: '/static/main.css', pod: 'cdn-edge-eu-1', status: 'error' },
    ],
  },
  reasoning: {
    observation: 'A config diff reduced the eu-west-1 origin-shield pool size from 200 to 50, causing 404s in that region only.',
    supportingEvidence: [
      '404 rate inflection matches the config diff timestamp exactly',
      'Other regions unaffected',
      'Pool size in new config: 50 (was 200)',
    ],
    confidence: 78,
    why: 'The change is local to one region and one config field. No other plausible cause correlates with the 404 inflection. Confidence is < 90 because the config field is not the only thing that changed in the diff.',
  },
  similarIncidents: [
    {
      id: 'sim_cdn_pool_aug',
      title: 'CDN origin pool size reduction',
      date: '2025-08-17',
      similarity: 0.89,
      resolutionTimeMinutes: 9,
      summary: 'Origin pool size reduced in us-east-1 caused 404s during a traffic spike.',
      rootCause: 'Config typo in the new pool size value.',
      resolution: 'Rolled back the config; added a config-diff safety check in the CDN deploy pipeline.',
      lessonsLearned: [
        'Config diffs should be reviewed by a second engineer.',
        'Pool size is a critical field — flag it in code review.',
        'Synthetic probes for asset 404 rate per region are essential.',
      ],
    },
    {
      id: 'sim_cdn_cache_miss',
      title: 'CDN cache miss spike',
      date: '2025-06-04',
      similarity: 0.72,
      resolutionTimeMinutes: 14,
      summary: 'Cache invalidation rule was too aggressive, evicting hot assets.',
      rootCause: 'A new invalidation pattern matched far more keys than intended.',
      resolution: 'Tightened the invalidation pattern; added a dry-run mode.',
      lessonsLearned: [
        'Invalidation patterns should be tested against a sample keyspace.',
        'Dry-run mode prevents production accidents.',
        'Cache hit ratio is a leading indicator — alert on drops.',
      ],
    },
    {
      id: 'sim_edge_deploy_apr',
      title: 'Edge node config drift',
      date: '2025-04-29',
      similarity: 0.68,
      resolutionTimeMinutes: 21,
      summary: 'Two edge nodes were running different config versions after a partial rollout.',
      rootCause: 'Config rollout hit a transient network error mid-deploy.',
      resolution: 'Added a verification step that diffs running config across the fleet.',
      lessonsLearned: [
        'Partial rollouts are dangerous — use atomic fleet updates.',
        'Config drift is a real failure mode, not just code drift.',
        'Verification is cheaper than incident response.',
      ],
    },
  ],
  recommendation: {
    title: 'Roll back the CDN config change.',
    estimatedRecovery: '3 minutes',
    risk: 'Low',
    reason: 'Rollback restores the previous pool size and immediately ends the 404s. No customer data is affected.',
    steps: [
      'Push the previous config version to the eu-west-1 edge cluster',
      'Verify 404 rate returns to baseline (< 0.1%)',
      'Add a config-diff safety check in the CDN deploy pipeline',
      'Add a synthetic asset probe for each region',
    ],
  },
  enkrypt: {
    safetyScore: 88,
    hallucinationRisk: 14,
    evidenceCoverage: 76,
    decision: 'Safe for Human Review',
    note: 'Lower confidence reflects that one of the two changed config fields has not been independently verified.',
  },
};

const KAFKA_CONSUMER_LAG: DemoIncident = {
  summary: {
    id: 'inc_kafka_consumer_lag_005',
    title: 'Kafka Consumer Lag',
    service: 'event-pipeline',
    environment: 'production',
    severity: 'high',
    status: 'open',
    aiConfidence: 91,
    startedAt: '2026-07-10T14:26:00Z',
    description:
      'Consumer group `events-pipeline-v2` is lagging by 4.2M messages. Lag is concentrated in 3 of 24 partitions.',
    timeLabel: '6 min ago',
    secondsAgo: 360,
  },
  timeline: [
    { id: 'alert', label: 'Alert Received', state: 'done', startedAt: '14:26', completedAt: '14:26:02', details: ['Trigger: consumer lag > 1M for > 2 minutes.'] },
    { id: 'classify', label: 'Severity Classification', state: 'done', startedAt: '14:26:02', completedAt: '14:26:04', details: ['P2 (High) — downstream pipelines at risk.'] },
    { id: 'context', label: 'Context Retrieval', state: 'done', startedAt: '14:26:04', completedAt: '14:26:06', details: ['2 similar incidents, runbook RB-018 (Consumer lag).'] },
    { id: 'rca', label: 'Root Cause Analysis', state: 'done', startedAt: '14:26:06', completedAt: '14:30', details: ['Hot-partition pattern: 3 partitions account for 92% of lag. Slow consumer is the analytics sink.'] },
    { id: 'recommendation', label: 'Recommendation', state: 'active', details: ['Scale the consumer group; enable the long-window fallback.'] },
    { id: 'approval', label: 'Human Approval', state: 'pending', details: ['Awaiting reviewer.'] },
    { id: 'resolution', label: 'Resolution', state: 'pending', details: ['Pending approval.'] },
  ],
  evidence: {
    metrics: [
      { label: 'Lag (msgs)', value: '4.2M', tone: 'critical', hint: '↑ 12x baseline (350k)' },
      { label: 'Throughput', value: '8k/s', tone: 'warning', hint: '↓ 40% from 13k/s' },
      { label: 'Partitions Hot', value: '3 / 24', tone: 'warning', hint: '92% of total lag' },
      { label: 'Affected Services', value: '4', tone: 'info', hint: 'event-pipeline, analytics-sink, search-indexer, audit-log' },
    ],
    logs: [
      { timestamp: '14:30:14', level: 'WARN', source: 'consumer-3', message: 'partition-12 lag 1.8M — slow processing 220ms/msg' },
      { timestamp: '14:28:50', level: 'WARN', source: 'consumer-3', message: 'partition-12 lag 1.4M' },
      { timestamp: '14:26:00', level: 'INFO', source: 'lag-monitor', message: 'consumer-group events-pipeline-v2 lag > 1M' },
    ],
    deployments: [
      { timestamp: '14:20', version: 'analytics-sink:v3.7.0', service: 'analytics-sink', author: 'henry@incidentmind.dev', status: 'deployed' },
      { timestamp: '14:00', version: 'event-pipeline:v5.2.0', service: 'event-pipeline', author: 'iris@incidentmind.dev', status: 'deployed' },
    ],
    traces: [
      { id: 'trace_kafka_001', duration: '0.220s', method: 'CONSUMER', endpoint: 'partition-12', pod: 'consumer-3', status: 'ok' },
      { id: 'trace_kafka_002', duration: '0.040s', method: 'CONSUMER', endpoint: 'partition-04', pod: 'consumer-3', status: 'ok' },
    ],
  },
  reasoning: {
    observation:
      'Consumer lag is concentrated in 3 of 24 partitions. The slow consumer is the analytics sink introduced in deploy v3.7.0.',
    supportingEvidence: [
      '3 partitions account for 92% of the lag',
      'analytics-sink:v3.7.0 deployed 6 minutes before lag crossed 1M',
      'Per-message processing time on the slow consumer: 220ms vs 40ms baseline',
    ],
    confidence: 91,
    why: 'The hot-partition pattern matches a slow consumer; the deploy timing is the only thing that changed in the affected path.',
  },
  similarIncidents: [
    {
      id: 'sim_hot_partition_jun',
      title: 'Hot partition after sink refactor',
      date: '2026-06-19',
      similarity: 0.9,
      resolutionTimeMinutes: 12,
      summary: 'A new analytics sink was 5x slower than the previous one, creating back-pressure on 3 partitions.',
      rootCause: 'The new sink did synchronous DB writes for every message.',
      resolution: 'Switched the sink to batched writes; added a per-partition lag dashboard.',
      lessonsLearned: [
        'Sinks should batch when downstream is a database.',
        'Per-partition lag visibility is essential.',
        'Slow consumers are a top cause of lag — not slow brokers.',
      ],
    },
    {
      id: 'sim_lag_after_rebalance',
      title: 'Lag after consumer rebalance',
      date: '2026-05-03',
      similarity: 0.78,
      resolutionTimeMinutes: 18,
      summary: 'Rebalance caused 2 minutes of reprocessing, creating a temporary lag spike.',
      rootCause: 'Rolling restart of consumers triggered a full rebalance.',
      resolution: 'Switched to cooperative-sticky assignor to minimize rebalance churn.',
      lessonsLearned: [
        'Cooperative-sticky assignor > eager round-robin for steady-state workloads.',
        'Rebalance cost is proportional to consumer count.',
        'Lag spikes during deploys need separate alerting.',
      ],
    },
    {
      id: 'sim_throughput_drop',
      title: 'Throughput drop on consumer fleet',
      date: '2026-02-11',
      similarity: 0.74,
      resolutionTimeMinutes: 26,
      summary: 'A noisy neighbor on the analytics node starved the consumer of CPU.',
      rootCause: 'A new background indexer consumed 80% of CPU on the analytics node.',
      resolution: 'Moved the indexer to its own node pool; added CPU fairness at the cgroup level.',
      lessonsLearned: [
        'Background jobs should not share a node with latency-sensitive workloads.',
        'Cgroup-level isolation is more reliable than per-process priorities.',
        'CPU fairness prevents noisy neighbors.',
      ],
    },
  ],
  recommendation: {
    title: 'Scale the consumer group and enable the long-window fallback.',
    estimatedRecovery: '5 minutes',
    risk: 'Low',
    reason: 'Scaling the consumer fleet absorbs the current spike; the long-window fallback catches up on historical aggregations without back-pressure.',
    steps: [
      'Scale `events-pipeline-v2` from 12 to 24 partitions',
      'Enable the long-window aggregation fallback',
      'Bump the in-flight queue budget from 5,000 to 12,000',
      'Open a follow-up to refactor analytics-sink to batched writes',
    ],
  },
  enkrypt: {
    safetyScore: 92,
    hallucinationRisk: 9,
    evidenceCoverage: 88,
    decision: 'Safe for Human Review',
  },
};

// --- Registry --------------------------------------------------------------

export const demoIncidents: DemoIncident[] = [
  PAYMENT_GATEWAY,
  REDIS_MEMORY,
  DB_CONNECTION_POOL,
  CDN_LATENCY,
  KAFKA_CONSUMER_LAG,
];

export function getDemoIncident(id: string): DemoIncident | null {
  return demoIncidents.find((i) => i.summary.id === id) ?? null;
}

export function listDemoIncidentSummaries(): DemoIncidentSummary[] {
  return demoIncidents.map((i) => i.summary);
}
