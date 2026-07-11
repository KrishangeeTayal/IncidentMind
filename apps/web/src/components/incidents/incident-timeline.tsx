// Compact vertical timeline of all events for an incident. Used in the
// "Overview" tab of the incident details page.

import type { TimelineEvent } from '@incidentmind/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timelineLabel } from './incident-severity-badge';
import { formatTime } from '@/lib/format';

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

export function IncidentTimeline({ events }: IncidentTimelineProps): JSX.Element {
  const ordered = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ordered.length === 0
            ? 'No events recorded yet.'
            : `${ordered.length} event${ordered.length === 1 ? '' : 's'} recorded.`}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {ordered.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            The workflow hasn't produced any events for this incident.
          </p>
        ) : (
          <ol className="space-y-3">
            {ordered.map((event, idx) => (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-muted-foreground/40"
                  />
                  {idx < ordered.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  ) : null}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{timelineLabel(event.kind)}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTime(event.createdAt)}
                    </span>
                  </div>
                  {event.actor ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.actor}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
