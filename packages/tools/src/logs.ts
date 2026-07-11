// Logs integration wrapper.
//
// Placeholder for fetching service logs (Loki, CloudWatch, Datadog
// Logs, etc.) that the Context Retrieval and RCA agents will use to
// correlate an incident with recent log output.

export interface LogQueryRequest {
  service: string;
  environment: string;
  from: string; // ISO-8601
  to: string; // ISO-8601
  /** Free-text search. Provider-specific semantics. */
  query?: string;
  limit?: number;
}

export interface LogEntryRecord {
  timestamp: string;
  service: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  attributes?: Record<string, unknown>;
}

export interface LogsConfig {
  provider: 'loki' | 'cloudwatch' | 'datadog' | 'custom';
  endpoint?: string;
  apiKey?: string;
}

export interface LogsClient {
  query(req: LogQueryRequest): Promise<LogEntryRecord[]>;
  ping(): Promise<boolean>;
}

/**
 * Build a logs client.
 *
 * NOTE: stub. Real implementation will be added in a later iteration.
 */
export function createLogsClient(_config: LogsConfig): LogsClient {
  const notImplemented = (name: string): never => {
    throw new Error(`[logs] ${name}() not implemented`);
  };
  return {
    query: () =>
      Promise.resolve([]).then(() => {
        notImplemented('query');
      }),
    ping: () => Promise.resolve(false),
  };
}
