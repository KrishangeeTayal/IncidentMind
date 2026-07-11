// GET /api/health — liveness/readiness probe.

import { ok, withErrorHandling } from '@/server/http';
import { APP_NAME } from '@incidentmind/shared';

export const GET = withErrorHandling(async () => {
  return ok({
    status: 'ok' as const,
    service: APP_NAME,
    timestamp: new Date().toISOString(),
  });
});
