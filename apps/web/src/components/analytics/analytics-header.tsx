'use client';

import { BarChart3 } from 'lucide-react';
import { TIME_RANGES, type TimeRange } from '@/lib/analytics-data';
import { cn } from '@/lib/utils';

interface AnalyticsHeaderProps {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function AnalyticsHeader({
  range,
  onRangeChange,
}: AnalyticsHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1.5">
        <h1 className="flex items-center gap-2 text-[28px] font-semibold tracking-tight text-slate-900">
          <BarChart3 className="h-5 w-5 text-slate-500" aria-hidden />
          Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Operational insights across your production environment.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Time range"
        className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-slate-200/80 bg-white p-0.5"
      >
        {TIME_RANGES.map((r) => {
          const active = r.id === range;
          return (
            <button
              key={r.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onRangeChange(r.id)}
              className={cn(
                'h-8 rounded-md px-3 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
