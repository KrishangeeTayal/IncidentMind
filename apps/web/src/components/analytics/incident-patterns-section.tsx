'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { IncidentPatternCard } from './incident-pattern-card';
import { IncidentPatternModal } from './incident-pattern-modal';
import { type IncidentPattern as Pattern, type TimeRange } from '@/lib/analytics-data';

interface IncidentPatternsSectionProps {
  patterns: Pattern[];
  rangeKey: TimeRange;
}

export function IncidentPatternsSection({
  patterns,
  rangeKey,
}: IncidentPatternsSectionProps): JSX.Element {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const active = activeIdx != null ? patterns[activeIdx] ?? null : null;

  return (
    <section
      key={rangeKey}
      aria-label="Top incident patterns"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Layers className="h-4 w-4 text-slate-500" aria-hidden />
            Top Incident Patterns
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            The most frequent incident shapes across this period. Click any card for the playbook.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {patterns.map((p, i) => (
          <li key={p.id} className="h-full">
            <IncidentPatternCard
              pattern={p}
              rank={i + 1}
              onOpen={() => setActiveIdx(i)}
            />
          </li>
        ))}
      </ul>

      <IncidentPatternModal
        pattern={active}
        rank={activeIdx != null ? activeIdx + 1 : null}
        onClose={() => setActiveIdx(null)}
      />
    </section>
  );
}
