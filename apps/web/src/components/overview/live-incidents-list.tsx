'use client';

// Live Production Incidents column. Title + 5 incident cards.

import { Activity } from 'lucide-react';
import { overviewIncidents } from '@/lib/overview-data';
import { LiveIncidentCard } from './live-incident-card';

export function LiveIncidentsList(): JSX.Element {
  return (
    <section
      aria-label="Live Production Incidents"
      className="flex h-full flex-col gap-4"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Live Production Incidents
          </h2>
          <p className="text-xs text-slate-500">
            {overviewIncidents.length} incidents across all services · sorted
            by severity
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <span className="pulse-success h-1.5 w-1.5 rounded-full bg-rose-500" />
          Live
        </span>
      </header>

      <ul className="flex flex-col gap-3">
        {overviewIncidents.map((incident) => (
          <li key={incident.id}>
            <LiveIncidentCard
              id={incident.id}
              title={incident.title}
              service={incident.service}
              environment={incident.environment}
              severity={incident.severity}
              status={incident.status}
              aiConfidence={incident.aiConfidence}
              timeLabel={incident.timeLabel}
              secondsAgo={incident.secondsAgo}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

void Activity;
