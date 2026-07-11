'use client';

// Step-by-step replay viewer. Walks through the timeline events in
// order with Previous/Next controls. No animations — just a clean
// step indicator.

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ListOrdered, RotateCcw } from 'lucide-react';
import type { TimelineEvent, TimelineEventKind } from '@incidentmind/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { timelineLabel } from './incident-severity-badge';
import { formatTime } from '@/lib/format';

interface ReplayViewerProps {
  events: TimelineEvent[];
}

const ORDER: TimelineEventKind[] = [
  'alert_received',
  'classification',
  'context_retrieved',
  'root_cause',
  'recommendation',
  'enkrypt_evaluation',
  'human_decision',
  'status_change',
  'note',
];

export function ReplayViewer({ events }: ReplayViewerProps): JSX.Element {
  // Order events by the workflow sequence, falling back to createdAt.
  const ordered = useMemo(() => {
    return [...events].sort((a, b) => {
      const ai = ORDER.indexOf(a.kind);
      const bi = ORDER.indexOf(b.kind);
      if (ai !== bi) {
        // Both known: compare positions; unknowns go to the end.
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [events]);

  const [index, setIndex] = useState(0);
  const hasEvents = ordered.length > 0;
  const current = hasEvents ? ordered[Math.min(index, ordered.length - 1)] : null;
  const isFirst = !hasEvents || index === 0;
  const isLast = !hasEvents || index === ordered.length - 1;

  const reset = (): void => setIndex(0);
  const next = (): void => setIndex((i) => Math.min(i + 1, ordered.length - 1));
  const prev = (): void => setIndex((i) => Math.max(i - 1, 0));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-muted-foreground" aria-hidden />
            Replay mode
          </CardTitle>
          {hasEvents ? (
            <span className="text-xs text-muted-foreground">
              Step {index + 1} of {ordered.length}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Walk through the workflow step by step. No animations — just the
          sequence.
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {hasEvents && current ? (
          <>
            <ol className="space-y-3">
              {ordered.map((event, idx) => {
                const isCurrent = idx === index;
                const isPast = idx < index;
                return (
                  <li key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${
                          isCurrent
                            ? 'bg-primary ring-4 ring-primary/15'
                            : isPast
                            ? 'bg-primary/40'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      {idx < ordered.length - 1 ? (
                        <span className="mt-1 w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIndex(idx)}
                      className={`flex-1 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isCurrent
                          ? 'border-primary/40 bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {timelineLabel(event.kind)}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatTime(event.createdAt)}
                        </span>
                      </div>
                      {event.actor ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.actor}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>

            <Separator />

            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {timelineLabel(current.kind)} · {formatTime(current.createdAt)}
              </p>
              <p className="mt-2 text-sm">
                {summarize(current)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={isFirst}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={isLast}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No timeline events have been recorded for this incident yet. Once the
            workflow runs, you can walk through each step here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function summarize(event: TimelineEvent): string {
  const payload = event.payload;
  if (!payload || typeof payload !== 'object') return 'No additional detail.';
  const obj = payload as Record<string, unknown>;
  switch (event.kind) {
    case 'alert_received':
      return typeof obj.title === 'string'
        ? `Alert received: ${obj.title}`
        : 'Alert received.';
    case 'classification':
      return typeof obj.severity === 'string'
        ? `Severity classified as ${String(obj.severity)}${
            typeof obj.reasoning === 'string' ? ` — ${obj.reasoning}` : ''
          }`
        : 'Severity classified.';
    case 'context_retrieved':
      return 'Context retrieved from Qdrant (similar incidents, runbooks, SOPs, post-mortems).';
    case 'root_cause':
      return typeof obj.rootCause === 'string'
        ? `Root cause: ${obj.rootCause}`
        : 'Root cause analysis complete.';
    case 'recommendation':
      return typeof obj.recommendation === 'string'
        ? `Recommended action: ${obj.recommendation}`
        : 'Recommendation generated.';
    case 'enkrypt_evaluation':
      return typeof obj.verdict === 'string'
        ? `Enkrypt verdict: ${String(obj.verdict)}`
        : 'Enkrypt evaluation complete.';
    case 'human_decision':
      return typeof obj.decision === 'string'
        ? `Human decision: ${String(obj.decision)}${
            typeof obj.reason === 'string' ? ` — ${obj.reason}` : ''
          }`
        : 'Human decision recorded.';
    case 'status_change':
      return typeof obj.status === 'string'
        ? `Status changed to ${String(obj.status)}.`
        : 'Status changed.';
    case 'note':
    default:
      return 'No additional detail.';
  }
}
