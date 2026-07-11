// Centralized analytics demo data. The Analytics page is a pure
// frontend experience — there are no API calls. The single source of
// truth for the page is this file.
//
// The data is keyed by `TimeRange` so the time selector in the header
// can drive the entire dashboard with one piece of state.

import type { IncidentSeverity } from '@incidentmind/shared';

// --- Time range ---------------------------------------------------------

export type TimeRange = 'today' | '7d' | '30d' | '90d';

export const TIME_RANGES: ReadonlyArray<{ id: TimeRange; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

// --- Types --------------------------------------------------------------

export interface AnalyticsKpis {
  totalIncidents: number;
  /** "12 min" */
  averageMttr: string;
  /** 0..100 */
  aiApprovalRate: number;
  /** 0..100 */
  aiAccuracy: number;
}

export interface TrendPoint {
  label: string;
  total: number;
  ai: number;
}

export interface SeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SourceRow {
  source: string;
  count: number;
}

export interface ResolutionTimeGroup {
  severity: IncidentSeverity;
  aiAssistedMinutes: number;
  manualMinutes: number;
}

export interface AIPerformance {
  recommendations: number;
  approvalRate: number;
  averageConfidence: number;
  falsePositiveRate: number;
  trends: {
    recommendations: number;
    approvalRate: number;
    averageConfidence: number;
    falsePositiveRate: number;
  };
}

export interface IncidentPattern {
  id: string;
  pattern: string;
  occurrences: number;
  /** "4 min" */
  avgRecovery: string;
  typicalRootCause: string;
  recommendedPlaybook: string;
  /** 0..100 */
  historicalSuccessRate: number;
}

export interface AnalyticsSnapshot {
  kpis: AnalyticsKpis;
  incidentTrend: TrendPoint[];
  severityDistribution: SeverityDistribution;
  sourceBreakdown: SourceRow[];
  resolutionTime: ResolutionTimeGroup[];
  aiPerformance: AIPerformance;
  patterns: IncidentPattern[];
}

// --- Deterministic per-range generation --------------------------------
//
// A small seeded RNG so values are stable across renders (and look
// "real" without any API or analytics backend).

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const RANGE_SEEDS: Record<TimeRange, number> = {
  today: 0x4d29_8c11,
  '7d': 0x71f4_22ab,
  '30d': 0x3a9b_19ce,
  '90d': 0x18ce_07f2,
};

function generateTrend(range: TimeRange): TrendPoint[] {
  const rng = makeRng(RANGE_SEEDS[range]);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ] as const;

  switch (range) {
    case 'today': {
      // 12 two-hour buckets
      return Array.from({ length: 12 }, (_, i) => {
        const base = 6 + Math.sin((i / 12) * Math.PI * 2) * 4;
        const total = Math.max(1, Math.round(base + rng() * 5));
        return {
          label: `${String(i * 2).padStart(2, '0')}:00`,
          total,
          ai: Math.max(0, Math.round(total * (0.7 + rng() * 0.2))),
        };
      });
    }
    case '7d': {
      return dayNames.map((label, i) => {
        const base = 18 + Math.sin((i / 7) * Math.PI * 2) * 8;
        const total = Math.max(4, Math.round(base + rng() * 10));
        return {
          label,
          total,
          ai: Math.max(0, Math.round(total * (0.7 + rng() * 0.2))),
        };
      });
    }
    case '30d': {
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const base = 14 + Math.sin((i / 30) * Math.PI * 4) * 8;
        const total = Math.max(2, Math.round(base + rng() * 8));
        return {
          label: `${monthNames[Math.floor(i / 3) % 12] ?? 'Jan'} ${day}`,
          total,
          ai: Math.max(0, Math.round(total * (0.7 + rng() * 0.2))),
        };
      });
    }
    case '90d': {
      return Array.from({ length: 12 }, (_, i) => {
        const base = 80 + Math.sin((i / 12) * Math.PI * 2) * 30;
        const total = Math.max(20, Math.round(base + rng() * 30));
        return {
          label: `W${i + 1}`,
          total,
          ai: Math.max(0, Math.round(total * (0.7 + rng() * 0.2))),
        };
      });
    }
  }
}

function generateResolutionTime(range: TimeRange): ResolutionTimeGroup[] {
  const factors: Record<TimeRange, number> = {
    today: 0.9,
    '7d': 1,
    '30d': 1.1,
    '90d': 1.25,
  };
  const f = factors[range];
  return [
    { severity: 'critical', aiAssistedMinutes: Math.round(8 * f), manualMinutes: Math.round(34 * f) },
    { severity: 'high',     aiAssistedMinutes: Math.round(6 * f), manualMinutes: Math.round(22 * f) },
    { severity: 'medium',   aiAssistedMinutes: Math.round(4 * f), manualMinutes: Math.round(14 * f) },
    { severity: 'low',      aiAssistedMinutes: Math.round(3 * f), manualMinutes: Math.round(8 * f) },
  ];
}

function generateSourceBreakdown(range: TimeRange): SourceRow[] {
  const factors: Record<TimeRange, number> = {
    today: 0.7,
    '7d': 1,
    '30d': 1.4,
    '90d': 2.0,
  };
  const f = factors[range];
  return [
    { source: 'API',           count: Math.round(46 * f) },
    { source: 'Database',      count: Math.round(31 * f) },
    { source: 'Cache',         count: Math.round(24 * f) },
    { source: 'Infrastructure', count: Math.round(18 * f) },
    { source: 'Network',       count: Math.round(11 * f) },
  ];
}

function generatePatterns(range: TimeRange): IncidentPattern[] {
  const f: Record<TimeRange, number> = {
    today: 0.7,
    '7d': 1,
    '30d': 1.6,
    '90d': 2.4,
  };
  const m = f[range];
  return [
    {
      id: 'pat_db_pool',
      pattern: 'Database connection pool exhaustion',
      occurrences: Math.round(18 * m),
      avgRecovery: '4 min',
      typicalRootCause:
        'A long-running query (typically analytics) holds OLTP connections past the saturation threshold, starving the application pool. Pgbouncer queue wait time climbs in the seconds before the alert fires.',
      recommendedPlaybook:
        'Identify the offending PID via pg_stat_activity, terminate it, then add a statement_timeout to the analytics role and route analytics through a dedicated read pool.',
      historicalSuccessRate: 94,
    },
    {
      id: 'pat_deploy_regression',
      pattern: 'Post-deploy regression (5xx surge)',
      occurrences: Math.round(14 * m),
      avgRecovery: '7 min',
      typicalRootCause:
        'A new release introduces a regression in error handling or resource lifecycle. Latency p99, error rate, and saturation metrics all spike within minutes of the rollout completing.',
      recommendedPlaybook:
        'Roll back to the previous known-good image, confirm metrics return to baseline, then open a follow-up with the offending change captured in the postmortem.',
      historicalSuccessRate: 92,
    },
    {
      id: 'pat_cache_stampede',
      pattern: 'Cache stampede after eviction',
      occurrences: Math.round(11 * m),
      avgRecovery: '6 min',
      typicalRootCause:
        'A misconfigured TTL or a sudden eviction event empties a hot key, sending all reads to the origin at once. Latency p99 climbs while cache hit ratio collapses.',
      recommendedPlaybook:
        'Restore the cache via warm-up, lock the TTL, and add a single-flight / stampede-protection guard at the read path.',
      historicalSuccessRate: 89,
    },
    {
      id: 'pat_kafka_lag',
      pattern: 'Kafka consumer lag spike',
      occurrences: Math.round(9 * m),
      avgRecovery: '8 min',
      typicalRootCause:
        'A slow consumer (often an analytics sink) creates back-pressure on a subset of partitions. The lag metric grows non-linearly once it crosses the alert threshold.',
      recommendedPlaybook:
        'Scale the consumer group, enable the long-window fallback, and audit the slow consumer for synchronous I/O. File a follow-up to refactor to batched writes.',
      historicalSuccessRate: 87,
    },
    {
      id: 'pat_dns',
      pattern: 'DNS resolution failure (egress)',
      occurrences: Math.round(6 * m),
      avgRecovery: '3 min',
      typicalRootCause:
        'An upstream DNS provider returns SERVFAIL for a critical record, usually after a zone cutover or an internal cache TTL expires.',
      recommendedPlaybook:
        'Switch to the secondary resolver, verify the affected FQDNs, then open a follow-up with the DNS team to investigate the provider-side cutover timing.',
      historicalSuccessRate: 96,
    },
  ];
}

function buildSnapshot(range: TimeRange): AnalyticsSnapshot {
  const factors: Record<TimeRange, { kpis: number; mttr: number; rate: number; acc: number }> = {
    today: { kpis: 18,  mttr: 11, rate: 94, acc: 97 },
    '7d':  { kpis: 147, mttr: 12, rate: 92, acc: 96 },
    '30d': { kpis: 612, mttr: 13, rate: 91, acc: 95 },
    '90d': { kpis: 1843, mttr: 15, rate: 89, acc: 94 },
  };
  const f = factors[range];

  return {
    kpis: {
      totalIncidents: f.kpis,
      averageMttr: `${f.mttr} min`,
      aiApprovalRate: f.rate,
      aiAccuracy: f.acc,
    },
    incidentTrend: generateTrend(range),
    severityDistribution: (() => {
      const factors2: Record<TimeRange, SeverityDistribution> = {
        today: { critical: 3,  high: 6,  medium: 5,  low: 4  },
        '7d':  { critical: 14, high: 38, medium: 56, low: 39 },
        '30d': { critical: 47, high: 168, medium: 232, low: 165 },
        '90d': { critical: 122, high: 487, medium: 712, low: 522 },
      };
      return factors2[range];
    })(),
    sourceBreakdown: generateSourceBreakdown(range),
    resolutionTime: generateResolutionTime(range),
    aiPerformance: {
      recommendations: Math.round(540 * (f.kpis / 147)),
      approvalRate: f.rate,
      averageConfidence: 93,
      falsePositiveRate: 4,
      trends: {
        recommendations: 12.4,
        approvalRate: 2.1,
        averageConfidence: 1.6,
        falsePositiveRate: -1.2,
      },
    },
    patterns: generatePatterns(range),
  };
}

// --- Public API --------------------------------------------------------

export const analyticsByRange: Record<TimeRange, AnalyticsSnapshot> = {
  today: buildSnapshot('today'),
  '7d': buildSnapshot('7d'),
  '30d': buildSnapshot('30d'),
  '90d': buildSnapshot('90d'),
};

export function getAnalyticsSnapshot(range: TimeRange): AnalyticsSnapshot {
  return analyticsByRange[range];
}
