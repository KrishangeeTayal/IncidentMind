// Visualizes incident counts per severity tier with animated fill.

import type { IncidentSeverity } from '@incidentmind/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SeverityDistributionProps {
  counts: Record<IncidentSeverity, number>;
  total?: number;
}

const ORDER: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];

const META: Record<
  IncidentSeverity,
  { label: string; track: string; bar: string; chip: string; dot: string }
> = {
  critical: {
    label: 'Critical',
    track: 'bg-rose-100/60',
    bar: 'bg-gradient-to-r from-rose-500 to-rose-400',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
  },
  high: {
    label: 'High',
    track: 'bg-orange-100/60',
    bar: 'bg-gradient-to-r from-orange-500 to-amber-400',
    chip: 'bg-orange-50 text-orange-700 ring-orange-200',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Medium',
    track: 'bg-amber-100/60',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    track: 'bg-sky-100/60',
    bar: 'bg-gradient-to-r from-sky-500 to-sky-400',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
  },
};

export function SeverityDistribution({
  counts,
  total,
}: SeverityDistributionProps): JSX.Element {
  const sum = total ?? ORDER.reduce((acc, s) => acc + (counts[s] ?? 0), 0);
  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Severity distribution</CardTitle>
          <span className="text-xs text-muted-foreground">
            {sum === 0 ? '0 incidents' : `${sum} total`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {ORDER.map((severity) => {
          const value = counts[severity] ?? 0;
          const pct = sum === 0 ? 0 : (value / sum) * 100;
          const meta = META[severity];
          return (
            <div key={severity} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
                      meta.chip,
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden />
                    {meta.label}
                  </span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {value}{' '}
                  <span className="text-muted-foreground/60">
                    · {pct.toFixed(0)}%
                  </span>
                </span>
              </div>
              <div
                className={cn(
                  'h-2 w-full overflow-hidden rounded-full',
                  meta.track,
                )}
              >
                <div
                  className={cn('h-full rounded-full progress-fill', meta.bar)}
                  style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
