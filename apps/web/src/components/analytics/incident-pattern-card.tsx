'use client';

import { ArrowUpRight, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IncidentPattern as Pattern } from '@/lib/analytics-data';

interface IncidentPatternCardProps {
  pattern: Pattern;
  rank: number;
  onOpen: () => void;
}

const RANK_TONE: Record<number, string> = {
  1: 'bg-rose-50 text-rose-600',
  2: 'bg-orange-50 text-orange-600',
  3: 'bg-amber-50 text-amber-600',
  4: 'bg-blue-50 text-blue-600',
  5: 'bg-slate-50 text-slate-600',
};

export function IncidentPatternCard({
  pattern,
  rank,
  onOpen,
}: IncidentPatternCardProps): JSX.Element {
  const rankTone = RANK_TONE[rank] ?? RANK_TONE[5]!;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group flex h-full w-full flex-col items-stretch rounded-xl border border-slate-200/80 bg-white p-4 text-left',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ',
            rankTone,
          )}
          aria-hidden
        >
          #{rank}
        </span>
        <ArrowUpRight
          className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-blue-500"
          aria-hidden
        />
      </div>

      <p className="mt-3 text-sm font-semibold leading-snug text-slate-900">
        {pattern.pattern}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <Layers className="h-3 w-3" aria-hidden />
            Occurrences
          </p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums text-slate-900">
            {pattern.occurrences}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <Clock className="h-3 w-3" aria-hidden />
            Avg recovery
          </p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums text-slate-900">
            {pattern.avgRecovery}
          </p>
        </div>
      </div>
    </button>
  );
}
