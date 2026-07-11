// GET /api/incidents/history — completed (mitigated/resolved) incidents.

import { ok, withErrorHandling } from '@/server/http';
import { IncidentService } from '@/server/services';

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const service = url.searchParams.get('service') ?? undefined;
  const limitRaw = url.searchParams.get('limit');
  const limit = limitRaw ? Math.max(1, Math.min(500, Number.parseInt(limitRaw, 10) || 100)) : 100;

  const data = await IncidentService.history({ service, limit });
  return ok(data);
});
