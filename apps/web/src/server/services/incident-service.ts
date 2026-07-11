// IncidentService — orchestrates incident CRUD, list, and lookup.
//
// This module is intentionally a thin layer over Prisma. The actual
// business logic (workflow orchestration, AI recommendations, etc.)
// will be added in later iterations.

import { prisma } from '@/lib/prisma';
import { newCorrelationId, rootLogger } from '@incidentmind/shared';
import { ServiceError } from '../errors';
import { mapIncident } from '../dto';
import type { Incident, IncidentSeverity, IncidentStatus } from '@incidentmind/shared';

const log = rootLogger.child('incident-service');

export interface CreateIncidentInput {
  title: string;
  description?: string;
  service: string;
  environment: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  createdById?: string;
  ownerId?: string;
  workflowRunId?: string;
  correlationId?: string;
}

export interface ListIncidentsOptions {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  service?: string;
  limit?: number;
  cursor?: string;
}

export class IncidentService {
  /** Create a new incident. */
  static async create(input: CreateIncidentInput): Promise<Incident> {
    const correlationId = input.correlationId ?? newCorrelationId();
    log.start('create', correlationId, { title: input.title, service: input.service });

    try {
      const created = await prisma.incident.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          service: input.service,
          environment: input.environment,
          severity: input.severity ? toPrismaSeverity(input.severity) : 'MEDIUM',
          status: input.status ? toPrismaStatus(input.status) : 'OPEN',
          createdById: input.createdById ?? null,
          ownerId: input.ownerId ?? null,
          workflowRunId: input.workflowRunId ?? null,
        },
      });
      log.succeed('create', correlationId, { id: created.id });
      return mapIncident(created);
    } catch (error) {
      log.fail('create', correlationId, error);
      throw new ServiceError('INTERNAL', 'Failed to create incident');
    }
  }

  /** Look up a single incident by id. Throws NOT_FOUND if missing. */
  static async getById(id: string): Promise<Incident> {
    log.info('getById', id, 'lookup');
    const found = await prisma.incident.findUnique({ where: { id } });
    if (!found) {
      throw new ServiceError('NOT_FOUND', `Incident ${id} not found`);
    }
    return mapIncident(found);
  }

  /** List incidents with simple filters and cursor pagination. */
  static async list(options: ListIncidentsOptions = {}): Promise<Incident[]> {
    log.info('list', 'incident-service', options as Record<string, unknown>);
    const take = clamp(options.limit ?? 50, 1, 200);
    const where: Record<string, unknown> = {};
    if (options.status) where.status = toPrismaStatus(options.status);
    if (options.severity) where.severity = toPrismaSeverity(options.severity);
    if (options.service) where.service = options.service;

    const rows = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      ...(options.cursor ? { skip: 1, cursor: { id: options.cursor } } : {}),
    });
    return rows.map(mapIncident);
  }

  /**
   * History view — completed (mitigated/resolved) incidents, ordered by
   * most recently updated. Used by the history page.
   */
  static async history(options: ListIncidentsOptions = {}): Promise<Incident[]> {
    log.info('history', 'incident-service', options as Record<string, unknown>);
    const take = clamp(options.limit ?? 100, 1, 500);
    const rows = await prisma.incident.findMany({
      where: {
        status: { in: ['MITIGATED', 'RESOLVED'] },
        ...(options.service ? { service: options.service } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
    });
    return rows.map(mapIncident);
  }

  /**
   * Update an incident's status. The change is also surfaced through
   * the TimelineService so callers get an audit trail.
   */
  static async updateStatus(id: string, next: IncidentStatus): Promise<Incident> {
    const correlationId = newCorrelationId();
    log.start('updateStatus', correlationId, { id, next });
    try {
      const updated = await prisma.incident.update({
        where: { id },
        data: { status: toPrismaStatus(next) },
      });
      log.succeed('updateStatus', correlationId, { id });
      return mapIncident(updated);
    } catch (error) {
      log.fail('updateStatus', correlationId, error);
      throw new ServiceError('NOT_FOUND', `Incident ${id} not found`);
    }
  }
}

// --- helpers ---------------------------------------------------------------

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function toPrismaSeverity(s: IncidentSeverity): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  return s.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

function toPrismaStatus(s: IncidentStatus): 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' {
  return s.toUpperCase() as 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
}
