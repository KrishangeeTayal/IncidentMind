// AnalyticsService — read-only aggregations over incident data.
//
// Returns small, serializable summaries that the web app can render
// without re-computing on the client.

import { prisma } from '@/lib/prisma';
import { rootLogger } from '@incidentmind/shared';

const log = rootLogger.child('analytics-service');

export interface AnalyticsSummary {
  totals: {
    incidents: number;
    open: number;
    investigating: number;
    mitigated: number;
    resolved: number;
  };
  bySeverity: Record<'low' | 'medium' | 'high' | 'critical', number>;
  byService: Array<{ service: string; count: number }>;
  mttrSeconds: number | null; // null when no resolved incidents exist
}

export class AnalyticsService {
  /**
   * Aggregate counts and MTTR across the entire incident table.
   * Returns null-safe defaults so the dashboard can render even when
   * the database is empty.
   */
  static async summary(): Promise<AnalyticsSummary> {
    log.info('summary', 'analytics-service', 'compute');

    const [all, bySeverity, byService, resolved] = await Promise.all([
      prisma.incident.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.incident.groupBy({ by: ['severity'], _count: { _all: true } }),
      prisma.incident.groupBy({
        by: ['service'],
        _count: { _all: true },
        orderBy: { _count: { service: 'desc' } },
        take: 10,
      }),
      prisma.incident.findMany({
        where: { status: 'RESOLVED' },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    const totals = {
      incidents: all.reduce((acc, r) => acc + r._count._all, 0),
      open: 0,
      investigating: 0,
      mitigated: 0,
      resolved: 0,
    };
    for (const r of all) {
      switch (r.status) {
        case 'OPEN':
          totals.open += r._count._all;
          break;
        case 'INVESTIGATING':
          totals.investigating += r._count._all;
          break;
        case 'MITIGATED':
          totals.mitigated += r._count._all;
          break;
        case 'RESOLVED':
          totals.resolved += r._count._all;
          break;
      }
    }

    const sevCounts: AnalyticsSummary['bySeverity'] = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    for (const r of bySeverity) {
      const key = r.severity.toLowerCase() as keyof AnalyticsSummary['bySeverity'];
      sevCounts[key] += r._count._all;
    }

    const mttrSeconds =
      resolved.length === 0
        ? null
        : Math.round(
            resolved.reduce(
              (acc, r) => acc + (r.updatedAt.getTime() - r.createdAt.getTime()),
              0,
            ) / resolved.length / 1000,
          );

    return {
      totals,
      bySeverity: sevCounts,
      byService: byService.map((r) => ({ service: r.service, count: r._count._all })),
      mttrSeconds,
    };
  }

  /**
   * Lightweight view used by the dashboard top cards.
   * Returns empty defaults when the database is empty.
   */
  static async dashboard(): Promise<{
    activeIncidents: number;
    pendingApprovals: number;
    mttrSeconds: number | null;
  }> {
    log.info('dashboard', 'analytics-service', 'compute');

    const [active, pending, resolved] = await Promise.all([
      prisma.incident.count({
        where: { status: { in: ['OPEN', 'INVESTIGATING', 'MITIGATED'] } },
      }),
      prisma.approval.count({ where: { decision: 'PENDING' } }),
      prisma.incident.findMany({
        where: { status: 'RESOLVED' },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    const mttrSeconds =
      resolved.length === 0
        ? null
        : Math.round(
            resolved.reduce(
              (acc, r) => acc + (r.updatedAt.getTime() - r.createdAt.getTime()),
              0,
            ) / resolved.length / 1000,
          );

    return { activeIncidents: active, pendingApprovals: pending, mttrSeconds };
  }
}
