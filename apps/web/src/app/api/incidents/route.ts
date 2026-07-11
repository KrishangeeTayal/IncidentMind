// GET /api/incidents — list incidents with simple filters.

import type { IncidentStatus, IncidentSeverity } from '@incidentmind/shared';
import { ok, withErrorHandling } from '@/server/http';
import { IncidentService } from '@/server/services';

const VALID_STATUS: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved'];
const VALID_SEVERITY: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);

  const statusParam = url.searchParams.get('status');
  const severityParam = url.searchParams.get('severity');
  const service = url.searchParams.get('service') ?? undefined;
  const limitRaw = url.searchParams.get('limit');
  const cursor = url.searchParams.get('cursor') ?? undefined;

  const status =
    statusParam && (VALID_STATUS as string[]).includes(statusParam)
      ? (statusParam as IncidentStatus)
      : undefined;
  const severity =
    severityParam && (VALID_SEVERITY as string[]).includes(severityParam)
      ? (severityParam as IncidentSeverity)
      : undefined;
  const limit = limitRaw ? Math.max(1, Math.min(200, Number.parseInt(limitRaw, 10) || 50)) : 50;

  const data = await IncidentService.list({ status, severity, service, limit, cursor });
  return ok(data);
});
