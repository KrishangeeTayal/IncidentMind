'use client';

// Incident Trend — multi-series line chart for the Dashboard.
// 4 severity lines (Critical / High / Medium / Low), smooth curves,
// soft area fills, simple legend, subtle grid lines. Last 12 points
// in the demo data are deterministic; the last point uses a dashed
// line to indicate a forward projection.

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface IncidentTrendChartProps {
  /** Title shown in the card header. */
  title?: string;
  /** Right-side pill label. */
  rangeLabel?: string;
  className?: string;
}

interface Series {
  key: 'critical' | 'high' | 'medium' | 'low';
  label: string;
  color: string;
  fill: string;
  data: number[];
  /** When true, render the last segment as a dashed line. */
  dashedLast?: boolean;
}

const HEIGHT = 220;
const PAD_X = 24;
const PAD_Y_TOP = 18;
const PAD_Y_BOTTOM = 26;

// Deterministic demo data — 12 buckets, last 24h.
const X_LABELS = [
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

const SERIES: Series[] = [
  {
    key: 'critical',
    label: 'Critical',
    color: '#DC2626',
    fill: 'url(#im-trend-critical)',
    data: [
      18, 20, 22, 24, 26, 28, 32, 34, 33, 30, 26, 22, 20, 18, 17, 16, 15, 14, 13,
      12, 12, 12, 13, 15, 19,
    ],
  },
  {
    key: 'high',
    label: 'High',
    color: '#EA580C',
    fill: 'url(#im-trend-high)',
    data: [
      10, 11, 12, 12, 13, 14, 15, 16, 15, 14, 12, 11, 10, 9, 8, 8, 7, 7, 6, 6, 6,
      6, 7, 8, 10,
    ],
  },
  {
    key: 'medium',
    label: 'Medium',
    color: '#D97706',
    fill: 'url(#im-trend-medium)',
    data: [
      4, 4, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    ],
  },
  {
    key: 'low',
    label: 'Low',
    color: '#94A3B8',
    fill: 'url(#im-trend-low)',
    data: [
      2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    dashedLast: true,
  },
];

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0]!;
    return `M ${p.x} ${p.y}`;
  }
  return points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1]!;
      const cx = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');
}

function buildAreaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
): string {
  if (points.length === 0) return '';
  const line = buildSmoothPath(points);
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function buildDashedTail(
  points: Array<{ x: number; y: number }>,
  startIdx: number,
): string {
  if (startIdx >= points.length - 1) return '';
  const seg = points.slice(startIdx);
  return buildSmoothPath(seg);
}

export function IncidentTrendChart({
  title = 'Incident Trend',
  rangeLabel = 'Last 24 Hours',
  className,
}: IncidentTrendChartProps): JSX.Element {
  const [width] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const all = SERIES.flatMap((s) => s.data);
    return Math.max(1, ...all) * 1.1;
  }, []);

  const n = X_LABELS.length;
  const xStep = n > 1 ? (width - PAD_X * 2) / (n - 1) : 0;
  const baselineY = HEIGHT - PAD_Y_BOTTOM;

  function toY(v: number): number {
    return (
      PAD_Y_TOP +
      (1 - v / maxValue) * (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM)
    );
  }

  const seriesPoints = SERIES.map((s) => ({
    series: s,
    points: s.data.map((v, i) => ({ x: PAD_X + i * xStep, y: toY(v) })),
  }));

  // Y-axis ticks: 0, 10, 20, 30, 40
  const yTicks = useMemo(() => {
    const ticks = [0, 10, 20, 30, 40];
    return ticks.map((v) => ({ v, y: toY(v) }));
  }, [maxValue]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>): void {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round((xRel - PAD_X) / xStep);
    setHover(Math.max(0, Math.min(n - 1, idx)));
  }

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

      <ul className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium text-slate-700">{s.label}</span>
          </li>
        ))}
      </ul>

      <div className="relative">
        <svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          className="block"
        >
          <defs>
            <linearGradient id="im-trend-critical" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="im-trend-high" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="im-trend-medium" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="im-trend-low" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {yTicks.map((t: { v: number; y: number }, i: number) => (
            <g key={i}>
              <line
                x1={PAD_X}
                x2={width - PAD_X}
                y1={t.y}
                y2={t.y}
                stroke="#E2E8F0"
                strokeDasharray="2 4"
                strokeWidth="1"
              />
              <text
                x={PAD_X - 8}
                y={t.y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#94A3B8"
                className="font-mono"
              >
                {t.v}
              </text>
            </g>
          ))}

          {/* Series */}
          {seriesPoints.map(({ series, points }) => {
            const dashedFrom = series.dashedLast ? n - 4 : n;
            const solidPath = buildSmoothPath(points.slice(0, dashedFrom));
            const dashedPath = series.dashedLast
              ? buildDashedTail(points, dashedFrom - 1)
              : '';
            const areaPath = buildAreaPath(points, baselineY);
            return (
              <g key={series.key}>
                <path d={areaPath} fill={series.fill} />
                <path
                  d={solidPath}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {dashedPath ? (
                  <path
                    d={dashedPath}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </g>
            );
          })}

          {/* Hover guide */}
          {hover != null ? (
            <g>
              <line
                x1={PAD_X + hover * xStep}
                x2={PAD_X + hover * xStep}
                y1={PAD_Y_TOP}
                y2={baselineY}
                stroke="#94A3B8"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
              {SERIES.map((s) => {
                const v = s.data[hover] ?? 0;
                return (
                  <circle
                    key={s.key}
                    cx={PAD_X + hover * xStep}
                    cy={toY(v)}
                    r="3.5"
                    fill="white"
                    stroke={s.color}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          ) : null}

          {/* X-axis labels (subset) */}
          {[0, 6, 12, 18, 24].map((idx) => {
            const x = PAD_X + idx * xStep;
            return (
              <text
                key={idx}
                x={x}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#94A3B8"
                className="font-mono"
              >
                {X_LABELS[idx]}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
