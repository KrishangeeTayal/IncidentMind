'use client';

// Reusable chart legend. Items are clickable and visually reflect
// their active state.

import { cn } from '@/lib/utils';

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string; // tailwind text/bg class for the swatch
  value?: string;
  active: boolean;
  onToggle: () => void;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps): JSX.Element {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={item.onToggle}
            aria-pressed={item.active}
            className={cn(
              'group inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-all',
              'hover:bg-slate-100',
              !item.active && 'opacity-40',
            )}
          >
            <span
              aria-hidden
              className={cn('h-2 w-2 rounded-full', item.color)}
            />
            <span className="font-medium text-slate-700">{item.label}</span>
            {item.value ? (
              <span className="font-mono tabular-nums text-slate-500">{item.value}</span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
