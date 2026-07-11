'use client';

// Page header for the Dashboard. Title + tagline, with a small
// services + time-range cluster on the right.

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionControlHeaderProps {
  services?: string;
  range?: string;
  className?: string;
}

export function MissionControlHeader({
  services = 'All Services',
  range = 'Last 24 Hours',
  className,
}: MissionControlHeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-4',
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Mission Control
        </h1>
        <p className="text-sm text-slate-500">
          Real-time overview of your infrastructure and AI operations.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <PillSelect label={services} />
        <PillSelect label={range} withIcon />
      </div>
    </header>
  );
}

function PillSelect({
  label,
  withIcon,
}: {
  label: string;
  withIcon?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700',
        'transition-colors hover:border-slate-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
      )}
    >
      {withIcon ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 text-slate-400"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ) : null}
      {label}
      <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
    </button>
  );
}
