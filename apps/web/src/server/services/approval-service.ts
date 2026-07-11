// ApprovalService — manages human approval of AI recommendations.
//
// Every recommendation produced by the agent workflow must be approved
// (or rejected) by a human before any action is taken. This service
// records those decisions and exposes queries for the UI.

import { prisma } from '@/lib/prisma';
import { newCorrelationId, rootLogger } from '@incidentmind/shared';
import { ServiceError } from '../errors';
import { mapApproval } from '../dto';
import type { Approval, ApprovalDecision } from '@incidentmind/shared';

const log = rootLogger.child('approval-service');

export interface CreateApprovalInput {
  incidentId: string;
  payload?: Record<string, unknown>;
}

export interface DecideApprovalInput {
  approvalId: string;
  decision: Exclude<ApprovalDecision, 'pending'>;
  reason?: string;
  decidedById?: string;
}

export class ApprovalService {
  /** Open a new pending approval for an incident. */
  static async createPending(input: CreateApprovalInput): Promise<Approval> {
    const correlationId = newCorrelationId();
    log.start('createPending', correlationId, { incidentId: input.incidentId });
    try {
      // Ensure the parent incident exists.
      const exists = await prisma.incident.findUnique({
        where: { id: input.incidentId },
        select: { id: true },
      });
      if (!exists) {
        throw new ServiceError('NOT_FOUND', `Incident ${input.incidentId} not found`);
      }

      const created = await prisma.approval.create({
        data: {
          incidentId: input.incidentId,
          decision: 'PENDING',
          payload: input.payload ?? {},
        },
      });
      log.succeed('createPending', correlationId, { id: created.id });
      return mapApproval(created);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      log.fail('createPending', correlationId, error);
      throw new ServiceError('INTERNAL', 'Failed to create approval');
    }
  }

  /** List approvals for an incident, most recent first. */
  static async listForIncident(incidentId: string): Promise<Approval[]> {
    log.info('listForIncident', correlationIdFor(incidentId), 'list');
    const rows = await prisma.approval.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapApproval);
  }

  /**
   * Mark a pending approval as approved or rejected. The decision is
   * recorded along with the actor and an optional reason.
   */
  static async decide(input: DecideApprovalInput): Promise<Approval> {
    const correlationId = newCorrelationId();
    log.start('decide', correlationId, { approvalId: input.approvalId, decision: input.decision });
    try {
      const existing = await prisma.approval.findUnique({ where: { id: input.approvalId } });
      if (!existing) {
        throw new ServiceError('NOT_FOUND', `Approval ${input.approvalId} not found`);
      }
      if (existing.decision !== 'PENDING') {
        throw new ServiceError('CONFLICT', `Approval ${input.approvalId} already decided`);
      }

      const updated = await prisma.approval.update({
        where: { id: input.approvalId },
        data: {
          decision: input.decision === 'approved' ? 'APPROVED' : 'REJECTED',
          reason: input.reason ?? null,
          decidedById: input.decidedById ?? null,
          decidedAt: new Date(),
        },
      });
      log.succeed('decide', correlationId, { id: updated.id, decision: updated.decision });
      return mapApproval(updated);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      log.fail('decide', correlationId, error);
      throw new ServiceError('INTERNAL', 'Failed to decide approval');
    }
  }

  /**
   * Convenience helper: find the latest pending approval for an incident.
   * Used by the approve/reject endpoints.
   */
  static async latestPendingForIncident(incidentId: string): Promise<Approval | null> {
    log.info('latestPendingForIncident', correlationIdFor(incidentId), 'lookup');
    const row = await prisma.approval.findFirst({
      where: { incidentId, decision: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    return row ? mapApproval(row) : null;
  }
}

function correlationIdFor(incidentId: string): string {
  return `inc-${incidentId}`;
}
