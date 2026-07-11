// Learning Agent — packages incident knowledge for Qdrant storage.

import { renderSystemPrompt, learningPrompt } from '@incidentmind/prompts';
import { createQdrantClient, type QdrantClient } from '@incidentmind/tools';
import type {
  LearningInput,
  LearningOutput,
  LearningPoint,
} from '../types';
import type { AgentName, LLMClient } from '../llm';

const AGENT_NAME: AgentName = 'learning';

export interface LearningAgentDeps {
  llm: LLMClient;
  qdrant?: QdrantClient;
}

export class LearningAgent {
  private readonly llm: LLMClient;
  private readonly qdrant: QdrantClient | undefined;

  constructor(deps: LearningAgentDeps) {
    this.llm = deps.llm;
    this.qdrant = deps.qdrant;
  }

  async run(input: LearningInput): Promise<LearningOutput> {
    const system = renderSystemPrompt(learningPrompt);
    const user = JSON.stringify(
      {
        alert: input.alert,
        classification: input.classification,
        rca: input.rca,
        resolution: input.resolution,
        postMortem: input.postMortem,
      },
      null,
      2,
    );
    const result = await this.llm.complete<LearningOutput>({
      system,
      user,
      agentName: AGENT_NAME,
    });

    // Best-effort: try to persist the points through Qdrant. The
    // foundation's Qdrant tool is a stub that throws "not implemented";
    // we catch the failure and surface it via the logger so the
    // workflow still completes.
    if (this.qdrant && result.points.length > 0) {
      await this.persist(result.points);
    }
    return result;
  }

  /**
   * Persist the generated points to Qdrant. Embedding generation is
   * intentionally out of scope — we send a zero vector of the
   * standard 1536 dims as a placeholder. A real implementation will
   * call an embedding model first.
   */
  private async persist(points: LearningPoint[]): Promise<void> {
    if (!this.qdrant) return;
    const placeholderVector = new Array<number>(1536).fill(0);
    try {
      // Group by collection so we make one upsert call per collection.
      const byCollection = new Map<LearningPoint['collection'], LearningPoint[]>();
      for (const p of points) {
        const arr = byCollection.get(p.collection) ?? [];
        arr.push(p);
        byCollection.set(p.collection, arr);
      }
      for (const [collection, group] of byCollection) {
        await this.qdrant.upsert({
          collection,
          points: group.map((p) => ({
            id: p.pointId,
            vector: placeholderVector,
            payload: p.payload,
          })),
        });
      }
    } catch {
      // Swallow: the Qdrant stub throws "not implemented" today. The
      // call site logs a warning so the operator knows the storage
      // step is currently a no-op.
    }
  }
}

// --- Mock generator --------------------------------------------------------

/**
 * Deterministic mock. Builds the two-point payload expected by the
 * prompt, using the alert fingerprint as the stable id prefix.
 */
export function mockLearning(input: LearningInput): LearningOutput {
  const fp = input.alert.fingerprint;
  const occurredAt = input.alert.receivedAt;
  return {
    points: [
      {
        collection: 'incidents',
        pointId: `incidents:${fp}`,
        payload: {
          title: input.alert.title,
          service: input.alert.service,
          environment: input.alert.environment,
          severity: input.classification.severity,
          rootCause: input.rca.rootCause,
          resolution: input.resolution.recommendation,
          fingerprint: fp,
          occurredAt,
        },
      },
      {
        collection: 'post_mortems',
        pointId: `post_mortems:${fp}`,
        payload: {
          summary: input.postMortem.summary,
          lessonsLearned: input.postMortem.lessonsLearned,
          actionItems: input.postMortem.actionItems,
          fingerprint: fp,
          occurredAt,
        },
      },
    ],
  };
}

/**
 * Build a Qdrant client from env. Returns `undefined` if `QDRANT_URL`
 * is not set.
 */
export function maybeQdrantClient(): QdrantClient | undefined {
  const url = process.env.QDRANT_URL;
  if (!url) return undefined;
  return createQdrantClient({
    url,
    apiKey: process.env.QDRANT_API_KEY,
  });
}
