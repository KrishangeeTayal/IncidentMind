'use client';

import { Clock, FileSearch, Gauge } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { SimilarIncidentModal } from './similar-incident-modal';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SimilarIncident } from '@/lib/demo-incidents';

interface SimilarIncidentsSectionProps {
  incidents: SimilarIncident[];
}

export function SimilarIncidentsSection({
  incidents,
}: SimilarIncidentsSectionProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);
  const openIncident = openId ? incidents.find((i) => i.id === openId) ?? null : null;

  return (
    <section
      id="section-similar"
      aria-labelledby="section-similar-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={4}
        title="Similar Incidents"
        subtitle="Historical cases retrieved from the incident knowledge base"
        icon={FileSearch}
        id="section-similar"
      />

      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {incidents.map((inc) => {
          const pct = inc.similarity * 100;
          return (
            <li key={inc.id}>
              <button
                type="button"
                onClick={() => setOpenId(inc.id)}
                className={cn(
                  'group flex h-full w-full flex-col im-card p-4 text-left transition-all duration-200',
                  'hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {inc.date}
                  </span>
                  <SimilarityBadge value={pct} />
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-slate-900">
                  {inc.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {inc.summary}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {inc.resolutionTimeMinutes} min to resolve
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100">
                    <Gauge className="h-3 w-3" aria-hidden />
                    Open
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <SimilarIncidentModal incident={openIncident} onClose={() => setOpenId(null)} />
    </section>
  );
}

function SimilarityBadge({ value }: { value: number }): JSX.Element {
  // Color band: 90+ blue, 80-90 violet, <80 slate
  const tone =
    value >= 90
      ? 'bg-blue-50 text-blue-700'
      : value >= 80
      ? 'bg-violet-50 text-violet-700'
      : 'bg-slate-100 text-slate-600';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ',
        tone,
      )}
    >
      <span className="font-mono tabular-nums">{value.toFixed(0)}%</span>
      match
    </span>
  );
}
