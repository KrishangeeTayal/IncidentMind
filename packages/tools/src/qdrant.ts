// Qdrant integration wrapper.
//
// This is a thin placeholder. The real implementation will talk to a
// Qdrant instance over HTTP/gRPC for vector search and RAG retrieval.

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface QdrantSearchRequest {
  collection: string;
  vector: number[];
  topK?: number;
  filter?: Record<string, unknown>;
}

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface QdrantUpsertRequest {
  collection: string;
  points: QdrantPoint[];
}

export interface QdrantConfig {
  url: string;
  apiKey?: string;
}

export interface QdrantClient {
  /** Semantic search over a collection. */
  search(req: QdrantSearchRequest): Promise<QdrantSearchResult[]>;
  /** Insert or update points in a collection. */
  upsert(req: QdrantUpsertRequest): Promise<void>;
  /** Health check; returns true if the cluster is reachable. */
  ping(): Promise<boolean>;
}

/**
 * Build a Qdrant client.
 *
 * NOTE: this returns a stub. The real implementation will be wired in once
 * the integration is approved. Calling any method throws `Not implemented`.
 */
export function createQdrantClient(_config: QdrantConfig): QdrantClient {
  const notImplemented = (name: string): never => {
    throw new Error(`[qdrant] ${name}() not implemented`);
  };
  return {
    search: () => Promise.resolve([]).then(() => {
      notImplemented('search');
    }),
    upsert: () => Promise.resolve().then(() => {
      notImplemented('upsert');
    }),
    ping: () => Promise.resolve(false),
  };
}
