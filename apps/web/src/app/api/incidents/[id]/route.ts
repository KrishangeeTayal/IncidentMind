// GET /api/incidents/[id] — full detail of a single incident.

import { ok, withErrorHandling } from '@/server/http';
import {
  ApprovalService,
  IncidentService,
  TimelineService,
} from '@/server/services';

interface RouteContext {
  params: { id: string };
}

export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const { id } = context.params;
  const incident = await IncidentService.getById(id);
  const [timeline, approvals] = await Promise.all([
    TimelineService.listForIncident(id),
    ApprovalService.listForIncident(id),
  ]);
  return ok({ incident, timeline, approvals });
});
