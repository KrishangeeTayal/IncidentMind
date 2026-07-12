'use client';

// Top bar — full width. Carries the platform brand on the left and
// the status / time / controls on the right. Matches the reference:
// very calm, no card backgrounds, single thin bottom border.

import { useEffect, useState } from 'react';
import { Activity, Menu, Sun, X } from 'lucide-react';
import { APP_NAME } from '@incidentmind/shared';
import { cn } from '@/lib/utils';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function TopBar(): JSX.Element {
  const [now, setNow] = useState<Date | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v: boolean) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
            <Activity className="h-4.5 w-4.5 text-white" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Operations Center
            </span>
          </div>
        </div>

        {/* Right cluster: status, time, theme, avatar */}
        <div className="flex items-center gap-4 sm:gap-5">
          <span className="hidden items-center gap-2 text-xs text-slate-600 sm:inline-flex">
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
            <span className="font-medium text-slate-700">Operational</span>
          </span>
          <span
            suppressHydrationWarning
            className="hidden font-mono text-xs tabular-nums text-slate-500 sm:inline"
          >
            {now ? formatTime(now) : '--:--:--'} UTC
          </span>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
          <button
            type="button"
            aria-label="Toggle theme"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Sun className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Account menu"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors',
              'bg-slate-900 hover:bg-slate-800',
            )}
          >
            KT
          </button>
        </div>
      </div>
    </header>
  );
}
