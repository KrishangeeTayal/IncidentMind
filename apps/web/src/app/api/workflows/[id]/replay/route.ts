// POST /api/workflows/[id]/replay — replay a previous workflow run.
//
// The [id] parameter is the workflow run id. A real implementation
// will look up the original run, feed it back into the Mastra workflow,
// and persist the resulting events. For now we acknowledge the request
// and return a placeholder response so the UI can wire against a stable
// shape.

import { ok, parseJsonBody, withErrorHandling } from '@/server/http';
import { ServiceError } from '@/server/errors';
import { newCorrelationId, type ReplayWorkflowRequest } from '@incidentmind/shared';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { id: string };
}

export const POST = withErrorHandling(async (request: Request, context: RouteContext) => {
  const { id } = context.params;

  let body: ReplayWorkflowRequest = {};
  try {
    body = parseJsonBody<ReplayWorkflowRequest>(await request.json().catch(() => ({})));
  } catch {
    // Empty body is acceptable.
  }

  // Sanity check: the workflow run id must be attached to a real incident.
  // We don't yet model workflow runs as their own table, so we treat the
  // id as `incident.workflowRunId`.
  const incident = await prisma.incident.findFirst({
    where: { workflowRunId: id },
    select: { id: true },
  });
  if (!incident) {
    throw new ServiceError('NOT_FOUND', `Workflow run ${id} not found`);
  }

  const correlationId = newCorrelationId();

  // The replay itself is not implemented yet — return a placeholder envelope.
  return ok({
    workflowRunId: id,
    incidentId: incident.id,
    status: 'queued' as const,
    correlationId,
    input: body.input ?? null,
  });
});
