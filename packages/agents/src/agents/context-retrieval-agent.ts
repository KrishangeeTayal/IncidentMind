// Context Retrieval Agent — pulls relevant knowledge from Qdrant.

import { renderSystemPrompt, contextRetrievalPrompt } from '@incidentmind/prompts';
import { createQdrantClient, type QdrantClient, type QdrantSearchResult } from '@incidentmind/tools';
import type {
  ContextRetrievalInput,
  ContextRetrievalOutput,
  RetrievedContext,
  RetrievedContextItem,
  RetrievedContextKind,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'context-retrieval';

const COLLECTIONS: Record<RetrievedContextKind, string> = {
  incident: 'incidents',
  runbook: 'runbooks',
  sop: 'sops',
  post_mortem: 'post_mortems',
};

export interface ContextRetrievalDeps {
  llm: LLMClient;
  qdrant?: QdrantClient;
}

export class ContextRetrievalAgent {
  private readonly llm: LLMClient;
  private readonly qdrant: QdrantClient | undefined;

  constructor(deps: ContextRetrievalDeps) {
    this.llm = deps.llm;
    this.qdrant = deps.qdrant;
  }

  async run(input: ContextRetrievalInput): Promise<ContextRetrievalOutput> {
    const system = renderSystemPrompt(contextRetrievalPrompt);
    const user = JSON.stringify({ alert: input.alert, classification: input.classification }, null, 2);
    return this.llm.complete<ContextRetrievalOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });
  }
}

// --- Mock generator --------------------------------------------------------

/**
 * Deterministic mock. The mock does NOT call Qdrant (the tool is a
 * stub in this foundation) — it returns empty buckets. The real
 * implementation will call `qdrant.search` for each collection and
 * bucket the results. The bucketing rule is encoded here so tests
 * covering the real path can rely on the same shape.
 */
export function mockContextRetrieval(
  _input: ContextRetrievalInput,
): RetrievedContext {
  return {
    similarIncidents: [],
    runbooks: [],
    sops: [],
    postMortems: [],
  };
}

// --- Real implementation helper (for future use) --------------------------

/**
 * Buckets raw Qdrant search results into the four `RetrievedContext`
 * categories. Exposed so the real implementation can reuse the same
 * logic once the Qdrant stub is replaced.
 */
export function bucketQdrantResults(
  results: QdrantSearchResult[],
): RetrievedContext {
  const out: RetrievedContext = {
    similarIncidents: [],
    runbooks: [],
    sops: [],
    postMortems: [],
  };
  for (const r of results) {
    const item = toRetrievedContextItem(r);
    if (!item) continue;
    switch (item.kind) {
      case 'incident':
        out.similarIncidents.push(item);
        break;
      case 'runbook':
        out.runbooks.push(item);
        break;
      case 'sop':
        out.sops.push(item);
        break;
      case 'post_mortem':
        out.postMortems.push(item);
        break;
    }
  }
  return out;
}

function toRetrievedContextItem(r: QdrantSearchResult): RetrievedContextItem | null {
  const kind = (r.payload.kind as RetrievedContextKind | undefined) ?? null;
  if (!kind) return null;
  const title = typeof r.payload.title === 'string' ? r.payload.title : r.id;
  const excerpt = typeof r.payload.excerpt === 'string'
    ? r.payload.excerpt.slice(0, 200)
    : '';
  const source =
    typeof r.payload.source === 'string' ? r.payload.source : 'qdrant';
  return { kind, id: r.id, title, excerpt, score: r.score, source };
}

/**
 * Build a Qdrant client from env. Returns `undefined` if `QDRANT_URL` is
 * not set so the agent can fall back to the empty-context path.
 */
export function maybeQdrantClient(): QdrantClient | undefined {
  const url = process.env.QDRANT_URL;
  if (!url) return undefined;
  return createQdrantClient({
    url,
    apiKey: process.env.QDRANT_API_KEY,
  });
}

void COLLECTIONS; // referenced for future real-path implementation
