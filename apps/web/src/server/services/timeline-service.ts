// TimelineService — append and query timeline events for an incident.
//
// Every meaningful action in the agent workflow produces a timeline
// event. This service owns the writes so the call sites stay tidy.

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { newCorrelationId, rootLogger } from '@incidentmind/shared/logger';
import { ServiceError } from '../errors';
import { mapTimelineEvent } from '../dto';
import type { TimelineEvent, TimelineEventKind } from '@incidentmind/shared';

const log = rootLogger.child('timeline-service');

export interface AppendEventInput {
  incidentId: string;
  kind: TimelineEventKind;
  payload?: Record<string, unknown>;
  actor?: string;
  correlationId?: string;
}

export class TimelineService {
  /** Append a single timeline event. */
  static async append(input: AppendEventInput): Promise<TimelineEvent> {
    const correlationId = input.correlationId ?? newCorrelationId();
    log.start('append', {
      incidentId: input.incidentId,
      kind: input.kind,
      correlationId,
    });
    try {
      // Ensure the incident exists before writing a child row.
      const exists = await prisma.incident.findUnique({
        where: { id: input.incidentId },
        select: { id: true },
      });
      if (!exists) {
        throw new ServiceError('NOT_FOUND', `Incident ${input.incidentId} not found`);
      }

      const created = await prisma.timelineEvent.create({
        data: {
          incidentId: input.incidentId,
          kind: toPrismaKind(input.kind),
          payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,
          actor: input.actor ?? null,
          correlationId,
        },
      });
      log.succeed('append', { id: created.id, correlationId });
      return mapTimelineEvent(created);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      log.fail('append', { error, correlationId });
      throw new ServiceError('INTERNAL', 'Failed to append timeline event');
    }
  }

  /** List timeline events for an incident in chronological order. */
  static async listForIncident(incidentId: string): Promise<TimelineEvent[]> {
    log.info('listForIncident', { incidentId: `inc-${incidentId}` });
    const rows = await prisma.timelineEvent.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(mapTimelineEvent);
  }
}

function toPrismaKind(
  k: TimelineEventKind,
):
  | 'ALERT_RECEIVED'
  | 'CLASSIFICATION'
  | 'CONTEXT_RETRIEVED'
  | 'ROOT_CAUSE'
  | 'RECOMMENDATION'
  | 'ENKRYPT_EVALUATION'
  | 'HUMAN_DECISION'
  | 'STATUS_CHANGE'
  | 'NOTE' {
  return k.toUpperCase() as
    | 'ALERT_RECEIVED'
    | 'CLASSIFICATION'
    | 'CONTEXT_RETRIEVED'
    | 'ROOT_CAUSE'
    | 'RECOMMENDATION'
    | 'ENKRYPT_EVALUATION'
    | 'HUMAN_DECISION'
    | 'STATUS_CHANGE'
    | 'NOTE';
}
