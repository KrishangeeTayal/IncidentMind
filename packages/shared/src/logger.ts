// Lightweight structured logger used across apps and packages.
//
// Design goals:
//   - Zero external dependencies so it can run in Next.js, Mastra, and tests.
//   - Each log line is structured: agentName, timestamp, correlationId, status.
//   - Pluggable sink: callers (or tests) can replace the default writer
//     with anything that accepts a serialized JSON line.

import { randomUUID } from 'node:crypto';
import type { LogEntry, LogStatus } from './types';

export type LogSink = (entry: LogEntry) => void;

// Default sink writes a single JSON line to stdout in production and a
// pretty version in development. Kept deliberately tiny — wire your
// real observability platform (Datadog, OTel, etc.) in by passing a
// custom sink to `createLogger`.
const defaultSink: LogSink = (entry) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const head = `[${entry.timestamp}] ${entry.agentName} ${entry.status.toUpperCase()}`;
    const tail = entry.message ? ` — ${entry.message}` : '';
    // eslint-disable-next-line no-console
    console.log(`${head}${tail}`);
    if (entry.meta && Object.keys(entry.meta).length > 0) {
      // eslint-disable-next-line no-console
      console.log('  meta:', entry.meta);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
};

export interface Logger {
  log(entry: Omit<LogEntry, 'timestamp'> & { timestamp?: string }): void;
  start(
    agentName: string,
    correlationId: string,
    meta?: Record<string, unknown>,
  ): void;
  succeed(
    agentName: string,
    correlationId: string,
    meta?: Record<string, unknown>,
  ): void;
  fail(
    agentName: string,
    correlationId: string,
    error: unknown,
    meta?: Record<string, unknown>,
  ): void;
  info(
    agentName: string,
    correlationId: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  warn(
    agentName: string,
    correlationId: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void;
  child(agentName: string, correlationId?: string): ChildLogger;
}

export interface ChildLogger {
  agentName: string;
  correlationId: string;
  log(status: LogStatus, message?: string, meta?: Record<string, unknown>): void;
  start(message?: string, meta?: Record<string, unknown>): void;
  succeed(message?: string, meta?: Record<string, unknown>): void;
  fail(error: unknown, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
}

export interface CreateLoggerOptions {
  agentName?: string;
  correlationId?: string;
  sink?: LogSink;
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const sink: LogSink = options.sink ?? defaultSink;

  const emit = (entry: Omit<LogEntry, 'timestamp'> & { timestamp?: string }): void => {
    const full: LogEntry = {
      agentName: entry.agentName,
      correlationId: entry.correlationId,
      status: entry.status,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      ...(entry.message !== undefined ? { message: entry.message } : {}),
      ...(entry.meta !== undefined ? { meta: entry.meta } : {}),
    };
    sink(full);
  };

  return {
    log(entry) {
      emit(entry);
    },
    start(agentName, correlationId, meta) {
      emit({ agentName, correlationId, status: 'started', ...(meta ? { meta } : {}) });
    },
    succeed(agentName, correlationId, meta) {
      emit({ agentName, correlationId, status: 'succeeded', ...(meta ? { meta } : {}) });
    },
    fail(agentName, correlationId, error, meta) {
      const merged: Record<string, unknown> = {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...(meta ?? {}),
      };
      emit({ agentName, correlationId, status: 'failed', meta: merged });
    },
    info(agentName, correlationId, message, meta) {
      emit({
        agentName,
        correlationId,
        status: 'info',
        message,
        ...(meta ? { meta } : {}),
      });
    },
    warn(agentName, correlationId, message, meta) {
      emit({
        agentName,
        correlationId,
        status: 'warn',
        message,
        ...(meta ? { meta } : {}),
      });
    },
    child(agentName, correlationId) {
      return createChildLogger(sink, agentName, correlationId ?? randomUUID());
    },
  };
}

function createChildLogger(
  sink: LogSink,
  agentName: string,
  correlationId: string,
): ChildLogger {
  const emit = (
    status: LogStatus,
    message: string | undefined,
    meta: Record<string, unknown> | undefined,
  ): void => {
    const entry: LogEntry = {
      agentName,
      correlationId,
      status,
      timestamp: new Date().toISOString(),
      ...(message !== undefined ? { message } : {}),
      ...(meta ? { meta } : {}),
    };
    sink(entry);
  };

  return {
    agentName,
    correlationId,
    log: emit,
    start(message, meta) {
      emit('started', message, meta);
    },
    succeed(message, meta) {
      emit('succeeded', message, meta);
    },
    fail(error, meta) {
      const merged: Record<string, unknown> = {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        ...(meta ?? {}),
      };
      emit('failed', undefined, merged);
    },
    info(message, meta) {
      emit('info', message, meta);
    },
    warn(message, meta) {
      emit('warn', message, meta);
    },
  };
}

export const rootLogger: Logger = createLogger({ agentName: 'incidentmind' });

/** Generate a new correlation id. Exposed so callers can mint ids early. */
export function newCorrelationId(): string {
  return randomUUID();
}
