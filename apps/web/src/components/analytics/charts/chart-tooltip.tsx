'use client';

// Reusable chart tooltip — a small card with a coloured top bar.

import { cn } from '@/lib/utils';

interface ChartTooltipProps {
  title: string;
  rows: Array<{
    label: string;
    value: string;
    color?: string; // tailwind bg class for the swatch
  }>;
  className?: string;
}

export function ChartTooltip({
  title,
  rows,
  className,
}: ChartTooltipProps): JSX.Element {
  return (
    <div
      className={cn(
        'pointer-events-none min-w-[160px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg',
        className,
      )}
    >
      <p className="border-b border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <ul className="space-y-1 p-2.5">
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              {row.color ? (
                <span
                  aria-hidden
                  className={cn('h-2 w-2 rounded-full', row.color)}
                />
              ) : null}
              {row.label}
            </span>
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
