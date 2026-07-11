// GET /api/analytics — full analytics summary.

import { ok, withErrorHandling } from '@/server/http';
import { AnalyticsService } from '@/server/services';

export const GET = withErrorHandling(async () => {
  const data = await AnalyticsService.summary();
  return ok(data);
});
