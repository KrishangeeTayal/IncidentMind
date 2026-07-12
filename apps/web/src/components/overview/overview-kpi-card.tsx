'use client';

// KPI card for the Overview page (and reused by Analytics, Knowledge,
// and the Workspace). White card, thin border, tinted icon circle,
// large metric, optional inline chip, secondary text underneath.

import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OverviewKpiCardProps {
  label: string;
  value: number;
  /** Optional pre-formatted display value (e.g. "12 min"). When set, count-up is bypassed. */
  displayValue?: string;
  secondaryLabel: string;
  icon: LucideIcon;
  /** Accent colour used only on the icon, dot, and metric text. */
  tone:
    | 'critical'
    | 'high'
    | 'warning'
    | 'success'
    | 'info'
    | 'ai'
    | 'muted';
  /** Optional inline chip beside the metric, e.g. "2 Critical" or "High Priority". */
  chip?: {
    label: string;
    tone: 'critical' | 'high' | 'warning' | 'success' | 'info' | 'ai' | 'muted';
  };
  trend?: string;
  trendTone?: 'good' | 'bad' | 'neutral';
}

const TONE: Record<
  OverviewKpiCardProps['tone'],
  { tint: string; text: string; chip: string; chipText: string; dot: string }
> = {
  critical: {
    tint: 'bg-rose-50',
    text: 'text-rose-600',
    chip: 'bg-rose-50',
    chipText: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  high: {
    tint: 'bg-orange-50',
    text: 'text-orange-600',
    chip: 'bg-orange-50',
    chipText: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  warning: {
    tint: 'bg-amber-50',
    text: 'text-amber-600',
    chip: 'bg-amber-50',
    chipText: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  success: {
    tint: 'bg-emerald-50',
    text: 'text-emerald-600',
    chip: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  info: {
    tint: 'bg-blue-50',
    text: 'text-blue-600',
    chip: 'bg-blue-50',
    chipText: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  ai: {
    tint: 'bg-blue-50',
    text: 'text-blue-600',
    chip: 'bg-blue-50',
    chipText: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  muted: {
    tint: 'bg-slate-100',
    text: 'text-slate-700',
    chip: 'bg-slate-50',
    chipText: 'text-slate-700',
    dot: 'bg-slate-400',
  },
};

function formatNumber(n: number): string {
  if (Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  return n.toFixed(1);
}

export function OverviewKpiCard({
  label,
  value,
  displayValue,
  secondaryLabel,
  icon: Icon,
  tone,
  chip,
  trend,
  trendTone,
}: OverviewKpiCardProps): JSX.Element {
  const t = TONE[tone];
  const chipMeta = chip ? TONE[chip.tone] : null;
  const TrendIcon =
    trendTone === 'good'
      ? TrendingUp
      : trendTone === 'bad'
      ? TrendingDown
      : Minus;
  const trendColor =
    trendTone === 'good'
      ? 'text-emerald-600'
      : trendTone === 'bad'
      ? 'text-rose-600'
      : 'text-slate-500';

  return (
    <div
      className={cn(
        'im-card im-card-hover group relative flex flex-col gap-3 p-5',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-xl',
            t.tint,
          )}
          aria-hidden
        >
          <Icon className={cn('h-4 w-4', t.text)} />
        </span>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <p
          className={cn(
            'text-[28px] font-semibold leading-none tracking-tight tabular-nums text-slate-900',
          )}
        >
          {displayValue ?? formatNumber(value)}
        </p>
        {chip && chipMeta ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              chipMeta.chip,
              chipMeta.chipText,
            )}
          >
            <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', chipMeta.dot)} />
            {chip.label}
          </span>
        ) : null}
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
              trendColor,
            )}
          >
            <TrendIcon className="h-2.5 w-2.5" aria-hidden />
            {trend}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">{secondaryLabel}</p>
    </div>
  );
}
