// POST /api/alerts — alert intake endpoint.
//
// Alerts received here are persisted as new incidents and trigger the
// workflow run (the actual trigger will be added when agents land).
// Today this just creates the incident and emits an `alert_received`
// timeline event so the rest of the system has a stable starting point.

import { ok, parseJsonBody, withErrorHandling } from '@/server/http';
import { IncidentService, TimelineService } from '@/server/services';
import { newCorrelationId } from '@incidentmind/shared/logger';
import type { CreateAlertRequest } from '@incidentmind/shared';
import { ServiceError } from '@/server/errors';

export const POST = withErrorHandling(async (request: Request) => {
  const body = parseJsonBody<CreateAlertRequest>(await request.json());

  if (!body.title || !body.service || !body.environment) {
    throw new ServiceError(
      'BAD_REQUEST',
      'title, service, and environment are required',
    );
  }

  const correlationId = newCorrelationId();
  const incident = await IncidentService.create({
    title: body.title,
    ...(body.description !== undefined ? { description: body.description } : {}),
    service: body.service,
    environment: body.environment,
    ...(body.severity !== undefined ? { severity: body.severity } : {}),
    correlationId,
  });

  await TimelineService.append({
    incidentId: incident.id,
    kind: 'alert_received',
    actor: body.source ?? 'alert-intake',
    correlationId,
    payload: body.raw ?? {},
  });

  return ok({ incident, correlationId }, { status: 201 });
});
