// POST /api/incidents/[id]/reject — record human rejection for an incident.
//
// Symmetric to the approve endpoint. A reason is encouraged but not
// required at the API layer.

import { fail, ok, parseJsonBody, withErrorHandling } from '@/server/http';
import { ApprovalService, TimelineService } from '@/server/services';
import { newCorrelationId } from '@incidentmind/shared/logger';
import type { ApprovalRequest } from '@incidentmind/shared';

interface RouteContext {
  params: { id: string };
}

export const POST = withErrorHandling(async (request: Request, context: RouteContext) => {
  const { id } = context.params;
  const correlationId = newCorrelationId();

  let body: ApprovalRequest = {};
  try {
    body = parseJsonBody<ApprovalRequest>(await request.json().catch(() => ({})));
  } catch {
    // Empty body is acceptable.
  }

  const existing = await ApprovalService.latestPendingForIncident(id);
  const approval = existing
    ? await ApprovalService.decide({
        approvalId: existing.id,
        decision: 'rejected',
        ...(body.reason !== undefined ? { reason: body.reason } : {}),
        ...(body.decidedById !== undefined ? { decidedById: body.decidedById } : {}),
      })
    : await ApprovalService
        .createPending({ incidentId: id, payload: body.payload ?? {} })
        .then((created) =>
          ApprovalService.decide({
            approvalId: created.id,
            decision: 'rejected',
            ...(body.reason !== undefined ? { reason: body.reason } : {}),
            ...(body.decidedById !== undefined ? { decidedById: body.decidedById } : {}),
          }),
        );

  if (!approval) {
    return fail('INTERNAL', 'Failed to record rejection', 500);
  }

  await TimelineService.append({
    incidentId: id,
    kind: 'human_decision',
    actor: body.decidedById ?? 'human',
    correlationId,
    payload: { decision: 'rejected', reason: body.reason ?? null },
  });

  return ok(approval);
});
