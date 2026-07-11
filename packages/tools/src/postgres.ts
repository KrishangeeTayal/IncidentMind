// PostgreSQL integration wrapper.
//
// The web app uses Prisma for typed access. This wrapper exists for
// the few places we need a lower-level escape hatch — analytics
// aggregations, ad-hoc read-only queries, or vector extension calls
// that don't belong in the Prisma schema.

export interface PostgresConfig {
  connectionString: string;
  /** Optional separate URL for read replicas. */
  replicaUrl?: string;
}

export interface PostgresClient {
  /**
   * Run a parameterized read-only query. The implementation must reject
   * statements containing semicolons, multi-statements, or known DDL
   * keywords. Throws if used in a way that isn't safe.
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  ping(): Promise<boolean>;
}

/**
 * Build a PostgreSQL client.
 *
 * NOTE: stub. Real implementation will use `pg` (node-postgres). For now,
 * we return a no-op client that throws on any query and reports healthy.
 */
export function createPostgresClient(_config: PostgresConfig): PostgresClient {
  const notImplemented = (name: string): never => {
    throw new Error(`[postgres] ${name}() not implemented`);
  };
  return {
    query: () =>
      Promise.resolve([]).then(() => {
        notImplemented('query');
      }),
    ping: () => Promise.resolve(false),
  };
}
