// Premium live incident feed: section header + Linear-style cards.

import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';
import type { Incident } from '@incidentmind/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentCard } from './incident-card';

interface LiveIncidentFeedProps {
  incidents: Incident[];
  /** Map of incident id → AI confidence (0..100). */
  confidenceById?: Record<string, number>;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function LiveIncidentFeed({
  incidents,
  confidenceById,
  emptyTitle = 'All systems operational',
  emptyDescription = 'AI agents are continuously monitoring your infrastructure for anomalies and operational risks.',
}: LiveIncidentFeedProps): JSX.Element {
  return (
    <Card className="border bg-card">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle>Live incident feed</CardTitle>
            <p className="text-xs text-muted-foreground">
              {incidents.length === 0
                ? 'No active incidents right now.'
                : `${incidents.length} incident${incidents.length === 1 ? '' : 's'} across all services.`}
            </p>
          </div>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {incidents.length === 0 ? (
          <EmptyFeed title={emptyTitle} description={emptyDescription} />
        ) : (
          <ul className="grid gap-3">
            {incidents.slice(0, 6).map((incident) => (
              <li key={incident.id}>
                <IncidentCard
                  incident={incident}
                  {...(confidenceById?.[incident.id] !== undefined
                    ? { aiConfidence: confidenceById[incident.id] }
                    : {})}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyFeed({
  title,
  description,
}: {
  title: string;
  description: string;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-gradient-to-b from-white to-slate-50/60 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
        <Inbox className="h-5 w-5 text-emerald-600" aria-hidden />
      </div>
      <p className="text-sm font-semibold tracking-tight">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
