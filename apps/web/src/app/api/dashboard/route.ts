// GET /api/dashboard — high-level counts for the dashboard view.

import { ok, withErrorHandling } from '@/server/http';
import { AnalyticsService } from '@/server/services';

export const GET = withErrorHandling(async () => {
  const data = await AnalyticsService.dashboard();
  return ok(data);
});
