// Premium KPI card. Used on the dashboard and analytics screens.

import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'amber' | 'emerald' | 'red' | 'purple' | 'slate';

interface KpiCardProps {
  label: string;
  value: number;
  /** Optional pre-formatted string (e.g. "1h 12m"). When set, the count-up is skipped. */
  displayValue?: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  /** Trend in % vs previous period. Positive = improvement when goodIsUp is true. */
  trend?: number;
  goodIsUp?: boolean;
}

const TONE_CLASSES: Record<Tone, { ring: string; icon: string; softBg: string; bar: string }> = {
  blue: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    softBg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  amber: {
    ring: 'ring-amber-100',
    icon: 'text-amber-600',
    softBg: 'bg-amber-50',
    bar: 'bg-amber-500',
  },
  emerald: {
    ring: 'ring-emerald-100',
    icon: 'text-emerald-600',
    softBg: 'bg-emerald-50',
    bar: 'bg-emerald-500',
  },
  red: {
    ring: 'ring-rose-100',
    icon: 'text-rose-600',
    softBg: 'bg-rose-50',
    bar: 'bg-rose-500',
  },
  purple: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    softBg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  slate: {
    ring: 'ring-slate-100',
    icon: 'text-slate-600',
    softBg: 'bg-slate-50',
    bar: 'bg-slate-500',
  },
};

function formatNumber(n: number): string {
  if (Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  return n.toFixed(1);
}

export function KpiCard({
  label,
  value,
  displayValue,
  hint,
  icon: Icon,
  tone = 'slate',
  trend,
  goodIsUp = false,
}: KpiCardProps): JSX.Element {
  const animated = useCountUp(Number.isFinite(value) ? value : 0, 800);
  const meta = TONE_CLASSES[tone];

  const showTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const trendIsPositive = showTrend && (trend as number) > 0;
  const trendIsZero = showTrend && (trend as number) === 0;
  const isGood = showTrend
    ? goodIsUp
      ? trendIsPositive
      : !trendIsPositive
    : false;
  const TrendIcon = trendIsZero ? Minus : trendIsPositive ? ArrowUp : ArrowDown;

  return (
    <Card className="card-elevate border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {showTrend ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  isGood
                    ? 'bg-emerald-50 text-emerald-700'
                    : trendIsZero
                    ? 'bg-slate-50 text-slate-600'
                    : 'bg-rose-50 text-rose-700',
                )}
              >
                <TrendIcon className="h-2.5 w-2.5" aria-hidden />
                {Math.abs(trend as number).toFixed(1)}%
              </span>
            ) : null}
          </div>
          {Icon ? (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl ring-1',
                meta.softBg,
                meta.ring,
              )}
            >
              <Icon className={cn('h-5 w-5', meta.icon)} aria-hidden />
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums">
          {displayValue ?? formatNumber(animated)}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
