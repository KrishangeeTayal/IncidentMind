'use client';

import { Search } from 'lucide-react';
import { IncidentCard } from './incident-card';
import { type KnowledgeIncident } from '@/lib/knowledge-data';

interface HistoricalIncidentsSectionProps {
  incidents: ReadonlyArray<KnowledgeIncident>;
  onOpen: (id: string) => void;
  activeIncidentId: string | null;
}

export function HistoricalIncidentsSection({
  incidents,
  onOpen,
  activeIncidentId,
}: HistoricalIncidentsSectionProps): JSX.Element {
  return (
    <section
      aria-label="Historical incidents"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Historical Incidents
        </h2>
        <p className="text-[11px] text-slate-400">
          Click a card to open the full incident memory.
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <p className="text-sm font-medium text-slate-700">
            No matching incidents
          </p>
          <p className="max-w-sm text-xs text-slate-500">
            Try removing a filter, or search for a different term.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {incidents.map((incident) => (
            <li key={incident.id} className="h-full">
              <IncidentCard
                incident={incident}
                isActive={activeIncidentId === incident.id}
                onOpen={() => onOpen(incident.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
