// POST /api/incidents/[id]/approve — record human approval for an incident.
//
// If no pending approval exists for the incident, one is created and
// immediately decided. The latest pending approval is always used when
// one is present.

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
    // Empty bodies are valid — only the request shape matters.
  }

  const existing = await ApprovalService.latestPendingForIncident(id);
  const approval = existing
    ? await ApprovalService.decide({
        approvalId: existing.id,
        decision: 'approved',
        ...(body.reason !== undefined ? { reason: body.reason } : {}),
        ...(body.decidedById !== undefined ? { decidedById: body.decidedById } : {}),
      })
    : await ApprovalService
        .createPending({ incidentId: id, payload: body.payload ?? {} })
        .then((created) =>
          ApprovalService.decide({
            approvalId: created.id,
            decision: 'approved',
            ...(body.reason !== undefined ? { reason: body.reason } : {}),
            ...(body.decidedById !== undefined ? { decidedById: body.decidedById } : {}),
          }),
        );

  if (!approval) {
    return fail('INTERNAL', 'Failed to record approval', 500);
  }

  await TimelineService.append({
    incidentId: id,
    kind: 'human_decision',
    actor: body.decidedById ?? 'human',
    correlationId,
    payload: { decision: 'approved', reason: body.reason ?? null },
  });

  return ok(approval);
});
