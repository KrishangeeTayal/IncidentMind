'use client';

// Incidents by Service — donut chart with a center "Total" label and
// a 5-row legend on the right. Static demo data, hover highlights a
// segment.

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface IncidentsByServiceChartProps {
  title?: string;
  rangeLabel?: string;
  className?: string;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

const SEGMENTS: Segment[] = [
  { label: 'Payment Service', value: 30, color: '#DC2626' }, // rose-600
  { label: 'User Service',    value: 25, color: '#EA580C' }, // orange-600
  { label: 'Order Service',   value: 20, color: '#D97706' }, // amber-600
  { label: 'Inventory Service', value: 15, color: '#2563EB' }, // violet-600
  { label: 'Other Services',  value: 10, color: '#CBD5E1' }, // slate-300
];

const CX = 100;
const CY = 100;
const R_OUTER = 80;
const R_INNER = 52;
const TOTAL = SEGMENTS.reduce((acc, s) => acc + s.value, 0);

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildArcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
): string {
  const a = buildSafeArc(cx, cy, rOuter, end, start);
  const b = polarToCartesian(cx, cy, rInner, start);
  const c = buildSafeArc(cx, cy, rInner, start, end);
  const d = polarToCartesian(cx, cy, rOuter, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${a.x} ${a.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${d.x} ${d.y}`,
    `L ${b.x} ${b.y}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${c.x} ${c.y}`,
    'Z',
  ].join(' ');
}

function buildSafeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): { x: number; y: number } {
  return polarToCartesian(cx, cy, r, endAngle);
}

export function IncidentsByServiceChart({
  title = 'Incidents by Service',
  rangeLabel = 'Last 24 Hours',
  className,
}: IncidentsByServiceChartProps): JSX.Element {
  const [hover, setHover] = useState<string | null>(null);

  const arcs = useMemo(() => {
    let start = 0;
    return SEGMENTS.map((s) => {
      const sweep = (s.value / TOTAL) * 360;
      const path = buildArcPath(CX, CY, R_OUTER, R_INNER, start, start + sweep);
      const seg = { ...s, path, start, end: start + sweep };
      start += sweep;
      return seg;
    });
  }, []);

  const focus = hover
    ? arcs.find((a: typeof arcs[number]) => a.label === hover)
    : null;

  return (
    <div className={cn('im-card p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300"
        >
          {rangeLabel}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr] md:items-center">
        <div className="relative">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            onMouseLeave={() => setHover(null)}
            className="block"
          >
            {arcs.map((seg: typeof arcs[number]) => (
              <path
                key={seg.label}
                d={seg.path}
                fill={seg.color}
                opacity={hover == null || hover === seg.label ? 1 : 0.4}
                onMouseEnter={() => setHover(seg.label)}
                className="cursor-pointer transition-opacity"
              />
            ))}
            <text
              x={CX}
              y={CY - 4}
              textAnchor="middle"
              fontSize="30"
              fontWeight="700"
              fill="#0F172A"
              className="font-sans"
            >
              {focus ? focus.value : TOTAL}
            </text>
            <text
              x={CX}
              y={CY + 16}
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill="#64748B"
              className="font-sans"
              letterSpacing="0.06em"
            >
              {focus ? focus.label.toUpperCase() : 'TOTAL'}
            </text>
          </svg>
        </div>

        <ul className="space-y-2.5">
          {arcs.map((seg: typeof arcs[number]) => (
            <li
              key={seg.label}
              onMouseEnter={() => setHover(seg.label)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
                hover === seg.label ? 'bg-slate-50' : 'hover:bg-slate-50/60',
              )}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-xs text-slate-700">{seg.label}</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                {seg.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
