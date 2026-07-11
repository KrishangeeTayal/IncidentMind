'use client';

// Severity Distribution — donut chart with center total, hoverable
// segments.

import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartLegend, type ChartLegendItem } from './chart-legend';
import type { SeverityDistribution } from '@/lib/analytics-data';

interface SeverityDonutChartProps {
  data: SeverityDistribution;
}

const SEVERITY_META = [
  {
    key: 'critical' as const,
    label: 'Critical',
    color: '#DC2626', // rose-600
    bg: 'bg-rose-500',
    ring: 'ring-rose-200',
    chip: 'bg-rose-50',
    chipText: 'text-rose-700',
    icon: ShieldAlert,
  },
  {
    key: 'high' as const,
    label: 'High',
    color: '#EA580C', // orange-600
    bg: 'bg-orange-500',
    ring: 'ring-orange-200',
    chip: 'bg-orange-50',
    chipText: 'text-orange-700',
    icon: AlertCircle,
  },
  {
    key: 'medium' as const,
    label: 'Medium',
    color: '#D97706', // amber-600
    bg: 'bg-amber-500',
    ring: 'ring-amber-200',
    chip: 'bg-amber-50',
    chipText: 'text-amber-700',
    icon: AlertTriangle,
  },
  {
    key: 'low' as const,
    label: 'Low',
    color: '#0EA5E9', // sky-500
    bg: 'bg-sky-500',
    ring: 'ring-sky-200',
    chip: 'bg-sky-50',
    chipText: 'text-sky-700',
    icon: Info,
  },
];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildArc(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, startAngle);
  const endInner = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

export function SeverityDonutChart({ data }: SeverityDonutChartProps): JSX.Element {
  const [hover, setHover] = useState<keyof SeverityDistribution | null>(null);

  const total = useMemo(
    () => data.critical + data.high + data.medium + data.low,
    [data],
  );

  // Compute arc segments.
  const cx = 90;
  const cy = 90;
  const rOuter = 80;
  const rInner = 52;

  const segments = useMemo(() => {
    let start = 0;
    if (total === 0) return [] as Array<{
      key: keyof SeverityDistribution;
      path: string;
      pct: number;
      count: number;
    }>;
    return SEVERITY_META.map((m) => {
      const count = data[m.key];
      const pct = count / total;
      const sweep = pct * 360;
      const path = buildArc(cx, cy, rOuter, rInner, start, start + sweep);
      start += sweep;
      return { key: m.key, path, pct, count };
    });
  }, [data, total]);

  const legend: ChartLegendItem[] = SEVERITY_META.map((m) => ({
    id: m.key,
    label: m.label,
    color: m.bg,
    value: String(data[m.key]),
    active: true,
    onToggle: () =>
      setHover((h: keyof SeverityDistribution | null) =>
        h === m.key ? null : m.key,
      ),
  }));

  const focusMeta = hover
    ? SEVERITY_META.find((m) => m.key === hover)
    : null;
  const hoverKey: keyof SeverityDistribution | null = hover;
  const focusCount =
    hoverKey != null ? data[hoverKey] : total;
  const focusLabel = focusMeta ? focusMeta.label : 'Total';
  const focusPct =
    hoverKey != null
      ? (data[hoverKey] / Math.max(1, total)) * 100
      : 100;

  return (
    <div className="im-card p-6">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Severity Distribution</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Breakdown of incidents by severity level.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr] md:items-center">
        <div className="relative mx-auto">
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            onMouseLeave={() => setHover(null)}
          >
            {/* Base ring (light) when total = 0 */}
            {total === 0 ? (
              <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#E2E8F0" strokeWidth={rOuter - rInner} />
            ) : null}

            {segments.map((seg: { key: keyof SeverityDistribution; path: string; pct: number; count: number }) => {
              const meta = SEVERITY_META.find((m) => m.key === seg.key)!;
              const isHover = hover === seg.key;
              return (
                <path
                  key={seg.key}
                  d={seg.path}
                  fill={meta.color}
                  opacity={hover == null || isHover ? 1 : 0.45}
                  onMouseEnter={() => setHover(seg.key)}
                  className="cursor-pointer transition-opacity"
                />
              );
            })}

            {/* Center text */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize="26"
              fontWeight="700"
              fill="#0F172A"
              className="font-sans"
            >
              {focusCount}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize="10"
              fontWeight="500"
              fill="#64748B"
              letterSpacing="0.06em"
              className="font-sans"
            >
              {focusLabel.toUpperCase()}
            </text>
            <text
              x={cx}
              y={cy + 30}
              textAnchor="middle"
              fontSize="9"
              fontWeight="500"
              fill="#94A3B8"
              className="font-sans"
            >
              {focusPct.toFixed(0)}%
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          {SEVERITY_META.map((m) => {
            const count = data[m.key];
            const pct = (count / Math.max(1, total)) * 100;
            const isHover = hover === m.key;
            return (
              <div
                key={m.key}
                onMouseEnter={() => setHover(m.key)}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  'group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-all',
                  'hover:border-slate-200 hover:bg-slate-50',
                  isHover && 'border-slate-200 bg-slate-50',
                )}
              >
                <span
                  className={cn('h-2.5 w-2.5 shrink-0 rounded-full', m.bg)}
                  aria-hidden
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700">{m.label}</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full transition-all duration-500', m.bg)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ChartLegend items={legend} className="mt-4" />
    </div>
  );
}
