'use client';

// Incident Sources — horizontal bar chart with hover highlight and
// proportional widths.

import { useState } from 'react';
import { Database, Globe, Layers, Network, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourceRow } from '@/lib/analytics-data';

interface SourceBarChartProps {
  data: SourceRow[];
}

const SOURCE_META: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  color: string; // tailwind bg class for the bar
  text: string;  // tailwind text class
  tint: string;  // tailwind bg class for the icon container
  tintText: string;
}> = {
  API:            { icon: Globe,    color: 'bg-blue-500',    text: 'text-blue-700',    tint: 'bg-blue-50',    tintText: 'text-blue-600' },
  Database:       { icon: Database, color: 'bg-violet-500',  text: 'text-violet-700',  tint: 'bg-violet-50',  tintText: 'text-violet-600' },
  Cache:          { icon: Layers,   color: 'bg-emerald-500', text: 'text-emerald-700', tint: 'bg-emerald-50', tintText: 'text-emerald-600' },
  Infrastructure: { icon: Server,   color: 'bg-amber-500',   text: 'text-amber-700',   tint: 'bg-amber-50',   tintText: 'text-amber-600' },
  Network:        { icon: Network,  color: 'bg-slate-500',   text: 'text-slate-700',   tint: 'bg-slate-100',  tintText: 'text-slate-600' },
};

function getMeta(name: string) {
  return (
    SOURCE_META[name] ?? {
      icon: Server,
      color: 'bg-slate-500',
      text: 'text-slate-700',
      tint: 'bg-slate-100',
      tintText: 'text-slate-600',
    }
  );
}

export function SourceBarChart({ data }: SourceBarChartProps): JSX.Element {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="im-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Incident Sources</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Where incidents originate, ranked by frequency.
        </p>
      </div>

      <ul className="space-y-3">
        {data.map((row) => {
          const meta = getMeta(row.source);
          const Icon = meta.icon;
          const pct = (row.count / max) * 100;
          const share = (row.count / Math.max(1, total)) * 100;
          const isHover = hover === row.source;
          return (
            <li
              key={row.source}
              onMouseEnter={() => setHover(row.source)}
              onMouseLeave={() => setHover(null)}
              className="group"
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                      meta.tint,
                      meta.tintText,
                    )}
                    aria-hidden
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-medium text-slate-700">{row.source}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                    {row.count}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-slate-400">
                    {share.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    meta.color,
                    hover && !isHover ? 'opacity-40' : '',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
