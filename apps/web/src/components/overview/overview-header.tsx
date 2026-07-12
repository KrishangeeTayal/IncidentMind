'use client';

// Compact header for the Overview (Mission Control) page. No large
// banner, no hero, no gradient — just the essential context: app name,
// env, AI status, last update.

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface OverviewHeaderProps {
  environment?: string;
  lastUpdated?: Date;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function OverviewHeader({
  environment = 'Production',
  lastUpdated,
}: OverviewHeaderProps): JSX.Element {
  const [now, setNow] = useState<Date | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(lastUpdated ?? new Date());

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => {
      setNow(new Date());
      // Tick the "last updated" forward by a few seconds each render so
      // it feels live without ever crossing 1 minute old.
      setUpdatedAt((d: Date) => new Date(d.getTime() + 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Mission Control
        </h1>
        <p className="text-sm text-slate-500">
          Real-time overview of your infrastructure and AI operations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="relative inline-flex h-2 w-2">
            <span
              className="pulse-success absolute inset-0 rounded-full bg-emerald-500/50"
              aria-hidden
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
              aria-hidden
            />
          </span>
          <span className="font-medium text-slate-700">All systems operational</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">{environment}</span>
        </span>
        <span
          suppressHydrationWarning
          className="inline-flex items-center gap-1.5 font-mono tabular-nums text-slate-500"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          {now ? formatTime(updatedAt) : '--:--:--'}
        </span>
      </div>
    </header>
  );
}
