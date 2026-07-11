// Centralized Knowledge-page demo data. Pure frontend — no API calls.
//
// Where topics overlap with the Workspace's demo incidents
// (Payment Gateway Timeout, Redis Memory Saturation, Database
// Connection Pool Exhaustion) the narrative is kept consistent so
// the two pages tell the same story without sharing a single file.

import type { IncidentSeverity } from '@incidentmind/shared';

// --- Filters ------------------------------------------------------------

export type IncidentStatus = 'resolved' | 'monitoring' | 'open';

export interface SeverityFilter {
  id: 'critical' | 'high' | 'medium' | 'low';
  label: string;
}
export interface ServiceFilter {
  id: 'payments' | 'redis' | 'database' | 'api-gateway' | 'infrastructure';
  label: string;
}
export interface StatusFilter {
  id: IncidentStatus;
  label: string;
}

export const SEVERITY_FILTERS: ReadonlyArray<SeverityFilter> = [
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const SERVICE_FILTERS: ReadonlyArray<ServiceFilter> = [
  { id: 'payments', label: 'Payments' },
  { id: 'redis', label: 'Redis' },
  { id: 'database', label: 'Database' },
  { id: 'api-gateway', label: 'API Gateway' },
  { id: 'infrastructure', label: 'Infrastructure' },
];

export const STATUS_FILTERS: ReadonlyArray<StatusFilter> = [
  { id: 'resolved', label: 'Resolved' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'open', label: 'Open' },
];

// --- Incident -----------------------------------------------------------

export interface TimelineEntry {
  time: string;
  title: string;
  detail: string;
}

export interface KnowledgeIncident {
  id: string;
  name: string;
  /** 0..100 */
  similarityScore: number;
  severity: IncidentSeverity;
  service: ServiceFilter['id'];
  /** "12 min" */
  resolutionTime: string;
  status: IncidentStatus;
  summary: string;
  rootCause: string;
  evidence: string[];
  aiRecommendation: string;
  finalResolution: string;
  lessonsLearned: string;
  timeline: TimelineEntry[];
  /** 0..100 */
  confidence: number;
  generatedRunbook: string;
  preventiveAction: string;
  detectedAt: string;
  resolvedAt: string;
}

export const knowledgeIncidents: ReadonlyArray<KnowledgeIncident> = [
  {
    id: 'kn_redis_memory_saturation',
    name: 'Redis Memory Saturation',
    similarityScore: 96,
    severity: 'critical',
    service: 'redis',
    resolutionTime: '8 min',
    status: 'resolved',
    summary:
      'Redis instance hit the configured maxmemory ceiling under a sudden write surge, triggering eviction storms and elevated tail latency for the checkout cache.',
    rootCause:
      'A bulk import job wrote 1.2M keys in under 90 seconds, exhausting the maxmemory-policy=volatile-lru pool. The eviction loop starved the main thread and made the cache effectively read-only for the duration.',
    evidence: [
      'redis_mem_used_bytes crossed 95% of maxmemory at 14:08:42',
      'evicted_keys/sec spiked from 0 to 4,200 within 30 seconds',
      'GET p99 latency on checkout:* rose to 480ms (baseline 3ms)',
      'Upstream call to /checkout dropped to 14% success rate',
    ],
    aiRecommendation:
      'Identify the offending key prefix via `redis-cli --bigkeys`, switch the import job to a streaming write pattern with rate limiting, and raise the maxmemory headroom by 30% to absorb future bursts.',
    finalResolution:
      'Killed the bulk import job, removed 380k cold keys via SCAN, raised maxmemory from 6GB to 9GB, and added a write-rate guard to the import client. Cache hit ratio recovered within 4 minutes.',
    lessonsLearned:
      'maxmemory headroom was sized for steady-state traffic, not import jobs. We now cap bulk imports at 10k keys/sec and alert on eviction rate above 200/sec.',
    timeline: [
      { time: '14:08:42', title: 'Anomaly detected', detail: 'Eviction rate alert fires (P2).' },
      { time: '14:09:11', title: 'AI hypothesis', detail: 'AI proposes Redis memory saturation based on metric shape.' },
      { time: '14:10:04', title: 'Human approval', detail: 'On-call approves AI mitigation plan.' },
      { time: '14:13:21', title: 'Import job killed', detail: 'Bulk import process terminated; eviction rate falls.' },
      { time: '14:16:50', title: 'Recovered', detail: 'Cache hit ratio back to 99.4%, p99 latency 4ms.' },
    ],
    confidence: 97,
    generatedRunbook:
      '1. Confirm alert scope (single instance vs cluster)\n2. Identify hot key prefix using --bigkeys and MEMORY USAGE\n3. Terminate the offending writer\n4. Issue SCAN+DEL on the cold prefix in batches of 1000\n5. Raise maxmemory if this is the second occurrence in 24h\n6. Page-ahead: short maxmemory headroom is the upstream design issue',
    preventiveAction:
      'Add a 85% memory-utilization alert (currently 95%) and require all bulk-write jobs to register a quota in the platform scheduler.',
    detectedAt: '2026-06-14 · 14:08',
    resolvedAt: '2026-06-14 · 14:16',
  },
  {
    id: 'kn_payment_gateway_timeout',
    name: 'Payment Gateway Timeout',
    similarityScore: 94,
    severity: 'critical',
    service: 'payments',
    resolutionTime: '12 min',
    status: 'resolved',
    summary:
      'Card authorization calls to the upstream gateway began exceeding the 8-second timeout, causing cascade failures across the checkout funnel and a wave of 5xx in the public API.',
    rootCause:
      'The gateway provider rolled out a new TLS handshake path on their edge that doubled the median handshake time for first-time connections. Our connection pool was sized for fast reuse and got starved of sockets.',
    evidence: [
      'gateway_tls_handshake_ms p50 rose from 80ms to 1.2s',
      'authorization_5xx_rate crossed 12% (alert at 1%)',
      'pool.available dropped to 0 for ~3 minutes',
      'Upstream CDN logs show the new handshake path from 13:51 UTC',
    ],
    aiRecommendation:
      'Pre-warm 50 TLS sessions to the gateway edge, temporarily increase the pool to 200 with a 4s timeout, and contact the gateway account team to confirm the rollout timing.',
    finalResolution:
      'Engineer applied the AI mitigation; the gateway provider reverted the handshake change at 14:24 UTC after confirming impact. Pool was returned to its original size once handshake time dropped back to baseline.',
    lessonsLearned:
      'Our pool is too small to absorb upstream handshake regressions. We now keep a 2x pre-warm buffer and alert on handshake p95 above 250ms for any external dependency.',
    timeline: [
      { time: '13:54:08', title: '5xx surge detected', detail: 'Public API error rate alert (P1).' },
      { time: '13:55:30', title: 'AI identifies cause', detail: 'AI correlates with gateway TLS metric shift.' },
      { time: '13:57:11', title: 'Mitigation approved', detail: 'Engineer approves pool pre-warm + 4s timeout.' },
      { time: '14:00:42', title: 'Error rate drops', detail: '5xx rate falls from 12% to 0.6%.' },
      { time: '14:24:00', title: 'Upstream fix', detail: 'Gateway provider reverts handshake change.' },
    ],
    confidence: 92,
    generatedRunbook:
      '1. Check upstream status page for in-flight changes\n2. Inspect TLS handshake p50/p95 on the gateway\n3. Increase pool size and pre-warm sessions\n4. Add temporary 4s timeout to absorb slowness\n5. Reach out to the upstream account team\n6. Once steady, restore original pool config',
    preventiveAction:
      'Add a daily synthetic transaction that exercises a real authorization to keep the pool warm and surface handshake regressions within 5 minutes.',
    detectedAt: '2026-05-22 · 13:54',
    resolvedAt: '2026-05-22 · 14:06',
  },
  {
    id: 'kn_checkout_api_latency',
    name: 'Checkout API Latency Spike',
    similarityScore: 89,
    severity: 'high',
    service: 'api-gateway',
    resolutionTime: '6 min',
    status: 'resolved',
    summary:
      'Checkout API p99 latency climbed from 320ms to 2.1s after a configuration push increased the upstream timeout, causing a hidden retry storm across the request fanout.',
    rootCause:
      'A service config change raised the per-call timeout for the fraud-check service from 500ms to 2s. The gateway retried any 500-class error up to 3 times, which combined to push the total time over the user-visible threshold.',
    evidence: [
      'fraud_check_timeout_ms p50 = 1980ms (was 480ms)',
      'gateway retry_attempts_total +340%',
      'checkout_api p99 = 2.1s (was 320ms)',
      'Configuration change SHA visible in deploy log at 09:14 UTC',
    ],
    aiRecommendation:
      'Roll back the config change to the previous SHA, and re-evaluate the fraud-check timeout against actual upstream behavior. The retry policy should be tightened for the new tail latency.',
    finalResolution:
      'Configuration rolled back; the team opened a follow-up to remove the hidden retry policy on this path and to add a guardrail preventing timeout changes from shipping without a canary.',
    lessonsLearned:
      'A config-only change is still a deploy. The platform should treat timeout changes as P1 deploys with mandatory canary.',
    timeline: [
      { time: '09:14:22', title: 'Config pushed', detail: 'fraud-check timeout raised from 500ms to 2s.' },
      { time: '09:15:01', title: 'p99 alert fires', detail: 'Checkout API latency alert (P2).' },
      { time: '09:16:45', title: 'AI correlates', detail: 'Links latency shape to the config change.' },
      { time: '09:18:30', title: 'Rollback', detail: 'Config rolled back to previous SHA.' },
      { time: '09:20:11', title: 'Recovered', detail: 'p99 latency back to 330ms.' },
    ],
    confidence: 95,
    generatedRunbook:
      '1. Check the config deploy log for the last 30 minutes\n2. Diff the new value against the previous SHA\n3. If latency correlates, roll back immediately\n4. Open a follow-up to add a canary for the config',
    preventiveAction:
      'Block any change to fraud-check timeout > 1s from being deployed without a P1 canary and on-call sign-off.',
    detectedAt: '2026-06-30 · 09:15',
    resolvedAt: '2026-06-30 · 09:21',
  },
  {
    id: 'kn_kubernetes_crashloop',
    name: 'Kubernetes CrashLoopBackOff',
    similarityScore: 84,
    severity: 'high',
    service: 'infrastructure',
    resolutionTime: '11 min',
    status: 'monitoring',
    summary:
      'A stateful set entered CrashLoopBackOff after a node pool rollout. The pod would start, fail its readiness probe in 8s, get killed, and restart.',
    rootCause:
      'The new node image had a stricter AppArmor profile that blocked the pod from reading its own certificate bundle. The readiness probe was a shell-out to `curl` against the local listener, which itself depended on the cert.',
    evidence: [
      '12 of 12 pods in the stateful set entered CrashLoopBackOff',
      'Logs show `permission denied` on `/etc/ssl/certs/ca-certificates.crt`',
      'New node image SHA `img-2026.06.18` rolled out 6 minutes before',
      'AppArmor profile `runtime/default` enforced',
    ],
    aiRecommendation:
      'Drain the affected nodes back to the previous image, and add a readiness probe that exercises the actual listener port (not a shell-out).',
    finalResolution:
      'Engineer drained the new nodes and reverted the image. The team is rewriting the readiness probe to use a TCP check against the application port, and opened a follow-up with platform to add an AppArmor audit to the rollout pipeline.',
    lessonsLearned:
      'Readiness probes that depend on the same surface they test (cert reads to call a server using those certs) amplify every config regression. The probe should be independent.',
    timeline: [
      { time: '22:14:00', title: 'Node rollout completes', detail: 'New image pushed to 4 nodes.' },
      { time: '22:16:30', title: 'CrashLoopBackOff', detail: 'Pods start failing readiness.' },
      { time: '22:18:00', title: 'AI diagnosis', detail: 'Links pod logs to the new image + AppArmor profile.' },
      { time: '22:22:11', title: 'Nodes drained', detail: 'Pods rescheduled on old image.' },
      { time: '22:25:00', title: 'Stable', detail: 'All 12 pods healthy.' },
    ],
    confidence: 88,
    generatedRunbook:
      '1. Confirm CrashLoopBackOff scope (one deployment vs many)\n2. Inspect the last 50 lines of pod logs for the failing container\n3. Check the node image and recent config rollouts\n4. If profile-related, drain and reschedule\n5. Rewrite any shell-out readiness probe as a TCP check\n6. File a follow-up with the platform team',
    preventiveAction:
      'Add AppArmor audit to the CI rollout pipeline; block merges that change the runtime profile without a rollback plan.',
    detectedAt: '2026-07-01 · 22:16',
    resolvedAt: '2026-07-01 · 22:25',
  },
  {
    id: 'kn_db_pool_exhaustion',
    name: 'Database Connection Pool Exhaustion',
    similarityScore: 91,
    severity: 'critical',
    service: 'database',
    resolutionTime: '4 min',
    status: 'resolved',
    summary:
      'OLTP connection pool exhausted by a long-running analytics query, starving the application pool and triggering 5xx across all data-serving endpoints.',
    rootCause:
      'An analytics job bypassed the read replica and ran a sequential scan against the primary. The query held connections past the saturation threshold while the application pool kept requesting new ones.',
    evidence: [
      'pg_stat_activity showed 96 connections to one analytics PID for 42 seconds',
      'Application pool wait time crossed 6s (alert at 1s)',
      'Sequential scan on `events` table of 480M rows',
      'No replica routing tag on the query plan',
    ],
    aiRecommendation:
      'Terminate the offending PID, set statement_timeout on the analytics role, and route analytics through the read replica pool.',
    finalResolution:
      'PID terminated; the analytics job was retried through the replica pool and completed in 8 minutes. statement_timeout=15s was set for the analytics role.',
    lessonsLearned:
      'Analytics has been allowed to run on the primary "just this once" for two years. The read replica is sized for it; we need to make the read replica the default path in the connection string.',
    timeline: [
      { time: '11:42:08', title: 'Pool wait alert', detail: 'Pool wait time crosses threshold (P1).' },
      { time: '11:43:00', title: 'AI diagnosis', detail: 'Identifies the long-running analytics query.' },
      { time: '11:44:21', title: 'PID terminated', detail: 'Engineer terminates the analytics PID.' },
      { time: '11:46:11', title: 'Recovered', detail: 'Pool wait time drops to 50ms.' },
    ],
    confidence: 96,
    generatedRunbook:
      '1. Query pg_stat_activity for the longest-running PIDs\n2. Confirm the role and the query plan\n3. Terminate the PID\n4. If analytics, route through the read replica\n5. Add statement_timeout to the role\n6. Open a follow-up to default the analytics role to the replica',
    preventiveAction:
      'Default the analytics database role to the read replica in the connection string. Any exception requires platform sign-off.',
    detectedAt: '2026-06-08 · 11:42',
    resolvedAt: '2026-06-08 · 11:46',
  },
  {
    id: 'kn_cdn_edge_failure',
    name: 'CDN Edge Failure',
    similarityScore: 78,
    severity: 'medium',
    service: 'infrastructure',
    resolutionTime: '3 min',
    status: 'resolved',
    summary:
      'A regional CDN edge returned 502 for ~7% of requests over a 4-minute window, causing elevated error rates on the marketing site and the public docs.',
    rootCause:
      'One edge node failed health checks and was removed from the pool, but the failover to the next edge took longer than the edge-local timeout for some assets.',
    evidence: [
      'CDN 502 rate for the us-east edge = 7.2% over 4 minutes',
      'Edge node `us-east-7` was removed from the pool at 18:02',
      'Failover time to us-east-12 = 1.8s (asset timeout 1.2s)',
      'Origin health was green for the full window',
    ],
    aiRecommendation:
      'Raise the asset timeout to 3s on the affected region and open a follow-up with the CDN provider to investigate the failover time.',
    finalResolution:
      'Engineer raised the asset timeout. The CDN provider reported a software bug in the failover path and pushed a fix at 19:10 UTC.',
    lessonsLearned:
      'Asset timeouts were tuned for steady-state, not for edge failovers. We need either a longer timeout or a faster CDN failover path.',
    timeline: [
      { time: '18:02:00', title: 'Edge node removed', detail: 'us-east-7 fails health checks.' },
      { time: '18:03:30', title: '502 alert', detail: 'CDN 502 rate alert (P3).' },
      { time: '18:05:11', title: 'Mitigation', detail: 'Asset timeout raised to 3s.' },
      { time: '18:07:00', title: 'Recovered', detail: '502 rate falls to <0.1%.' },
    ],
    confidence: 81,
    generatedRunbook:
      '1. Confirm origin is green (don\'t waste time chasing origin)\n2. Check the regional edge status\n3. If edge failure, raise the asset timeout temporarily\n4. Open a ticket with the CDN provider\n5. Once fixed, restore the original timeout',
    preventiveAction:
      'Negotiate a sub-second failover SLA with the CDN provider and add a synthetic asset request from each region every minute.',
    detectedAt: '2026-05-04 · 18:03',
    resolvedAt: '2026-05-04 · 18:07',
  },
];

// --- Runbooks -----------------------------------------------------------

export interface Runbook {
  id: string;
  title: string;
  services: ReadonlyArray<ServiceFilter['id']>;
  /** "12 min" */
  estimatedRecovery: string;
  /** 0..100 */
  successRate: number;
  steps: string[];
  triggers: string[];
  lastUsed: string;
}

export const knowledgeRunbooks: ReadonlyArray<Runbook> = [
  {
    id: 'rb_cache_pressure',
    title: 'Cache Pressure Runbook',
    services: ['redis', 'api-gateway'],
    estimatedRecovery: '8 min',
    successRate: 94,
    triggers: [
      'Cache hit ratio below 90% for 2 minutes',
      'Eviction rate above 200 keys/sec',
      'Upstream read latency p95 above 200ms',
    ],
    steps: [
      'Identify the hot key prefix using `redis-cli --bigkeys` and `MEMORY USAGE`.',
      'Terminate the offending writer (bulk import, sync, replay).',
      'Evict the cold prefix in batches of 1000 with SCAN+DEL.',
      'Raise maxmemory headroom by 30% if this is the second occurrence in 24h.',
      'Page-ahead: short maxmemory headroom is the upstream design issue.',
    ],
    lastUsed: '2 days ago · 6 incidents',
  },
  {
    id: 'rb_upstream_timeout',
    title: 'Upstream Timeout Runbook',
    services: ['payments', 'api-gateway'],
    estimatedRecovery: '6 min',
    successRate: 91,
    triggers: [
      'External dependency handshake p95 above 250ms',
      '5xx rate above 1% for 3 minutes',
      'Connection pool saturation above 90%',
    ],
    steps: [
      'Check the upstream provider status page for in-flight changes.',
      'Inspect TLS handshake p50/p95 on the dependency.',
      'Increase pool size and pre-warm sessions.',
      'Add a temporary 4s timeout to absorb slowness.',
      'Reach out to the upstream account team via the on-call Slack channel.',
      'Once steady, restore the original pool configuration.',
    ],
    lastUsed: '5 days ago · 3 incidents',
  },
  {
    id: 'rb_database_saturation',
    title: 'Database Saturation Runbook',
    services: ['database'],
    estimatedRecovery: '5 min',
    successRate: 96,
    triggers: [
      'Pool wait time above 1s for 1 minute',
      'Long-running query (>30s) on the primary',
      'OLTP success rate below 99%',
    ],
    steps: [
      'Query pg_stat_activity for the longest-running PIDs.',
      'Confirm the role and the query plan (is this analytics on the primary?).',
      'Terminate the PID if it\'s misrouted.',
      'Route the workload through the read replica.',
      'Add a statement_timeout to the offending role.',
      'Open a follow-up to default analytics roles to the replica.',
    ],
    lastUsed: '1 day ago · 4 incidents',
  },
  {
    id: 'rb_deploy_regression',
    title: 'Post-Deploy Regression Runbook',
    services: ['infrastructure', 'api-gateway'],
    estimatedRecovery: '7 min',
    successRate: 88,
    triggers: [
      'Latency or error rate spike within 30 minutes of a deploy',
      'Canary metric diverges from baseline by >15%',
      'Pod restart count or CrashLoopBackOff on the new revision',
    ],
    steps: [
      'Confirm the deploy SHA in the rollout log.',
      'Diff the change against the previous SHA.',
      'If latency or error rate correlates, roll back immediately.',
      'Freeze the change and open a follow-up to add a canary.',
      'Verify metrics return to baseline before the next attempt.',
    ],
    lastUsed: '4 hours ago · 2 incidents',
  },
];

// --- AI Insights --------------------------------------------------------

export interface AiInsight {
  title: string;
  body: string;
  bullets: ReadonlyArray<string>;
  confidence: number;
  lastUpdated: string;
}

export const aiInsight: AiInsight = {
  title: 'What the AI Learned',
  body:
    'Cross-incident patterns the AI has surfaced from the last 90 days of operational memory.',
  bullets: [
    'Payment Gateway failures are frequently preceded by Redis memory pressure on the checkout cache.',
    'Similar incidents were resolved 37% faster after enabling automatic cache eviction alerts.',
    'Kubernetes CrashLoops correlate with node image rollouts within a 10-minute window.',
    'Database pool exhaustion almost always traces back to analytics jobs on the primary.',
    'Recommend adding a proactive Redis memory alert at 85% (current threshold is 95%).',
  ],
  confidence: 96,
  lastUpdated: 'Synced 3 minutes ago',
};

// --- KPI ----------------------------------------------------------------

export interface KnowledgeKpis {
  historicalIncidents: number;
  runbooks: number;
  lessonsLearned: number;
  /** 0..100 */
  averageAiMatchConfidence: number;
}

export const knowledgeKpis: KnowledgeKpis = {
  historicalIncidents: 742,
  runbooks: 52,
  lessonsLearned: 186,
  averageAiMatchConfidence: 96,
};
