'use client';

// Incident Trend — line chart with optional AI-handled overlay.
// SVG-rendered, hover shows a vertical guide + tooltip.

import { useMemo, useState } from 'react';
import { ChartTooltip } from './chart-tooltip';
import { ChartLegend, type ChartLegendItem } from './chart-legend';
import { TrendingUp } from 'lucide-react';
import type { TrendPoint } from '@/lib/analytics-data';

interface IncidentTrendChartProps {
  data: TrendPoint[];
  showTotal: boolean;
  showAI: boolean;
  onToggleTotal: () => void;
  onToggleAI: () => void;
}

const HEIGHT = 220;
const PAD_X = 24;
const PAD_Y_TOP = 20;
const PAD_Y_BOTTOM = 28;

function buildPath(
  points: Array<{ x: number; y: number }>,
): { line: string; area: string } {
  if (points.length === 0) return { line: '', area: '' };
  if (points.length === 1) {
    const p = points[0]!;
    return { line: `M ${p.x} ${p.y}`, area: '' };
  }

  // Catmull-Rom-ish smooth curve using cubic Beziers.
  const line = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1]!;
      const cx = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');

  const last = points[points.length - 1]!;
  const first = points[0]!;
  const area = `${line} L ${last.x} ${HEIGHT - PAD_Y_BOTTOM} L ${first.x} ${HEIGHT - PAD_Y_BOTTOM} Z`;
  return { line, area };
}

export function IncidentTrendChart({
  data,
  showTotal,
  showAI,
  onToggleTotal,
  onToggleAI,
}: IncidentTrendChartProps): JSX.Element {
  const [width, setWidth] = useState(640);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const totals = data.map((d) => d.total);
    return Math.max(1, ...totals) * 1.15;
  }, [data]);

  const xStep =
    data.length > 1
      ? (width - PAD_X * 2) / (data.length - 1)
      : 0;

  function toPoint(d: TrendPoint, value: number, idx: number) {
    const x = PAD_X + idx * xStep;
    const y =
      PAD_Y_TOP +
      (1 - value / maxValue) * (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM);
    return { x, y, d, value };
  }

  const totalPoints = data.map((d, i) => toPoint(d, d.total, i));
  const aiPoints = data.map((d, i) => toPoint(d, d.ai, i));

  const totalPath = useMemo(
    () => buildPath(totalPoints.map((p) => ({ x: p.x, y: p.y }))),
    [totalPoints],
  );
  const aiPath = useMemo(
    () => buildPath(aiPoints.map((p) => ({ x: p.x, y: p.y }))),
    [aiPoints],
  );

  // Y-axis ticks (3 levels)
  const yTicks = useMemo(() => {
    return [0, 0.5, 1].map((t) => ({
      y: PAD_Y_TOP + t * (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM),
      v: Math.round(maxValue * (1 - t)),
    }));
  }, [maxValue]);

  // X-axis labels: only show a subset to avoid crowding.
  const xLabels = useMemo(() => {
    if (data.length <= 8) {
      return data.map((d, i) => ({ idx: i, label: d.label }));
    }
    const step = Math.ceil(data.length / 6);
    return data
      .map((d, i) => ({ idx: i, label: d.label }))
      .filter((_, i) => i % step === 0 || i === data.length - 1);
  }, [data]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>): void {
    if (data.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round((xRel - PAD_X) / xStep);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setHoverIdx(clamped);
  }

  const hover = hoverIdx != null ? data[hoverIdx] : null;
  const hoverX = hoverIdx != null ? PAD_X + hoverIdx * xStep : null;

  const legend: ChartLegendItem[] = [
    {
      id: 'total',
      label: 'Total incidents',
      color: 'bg-blue-600',
      value: hover ? String(hover.total) : undefined,
      active: showTotal,
      onToggle: onToggleTotal,
    },
    {
      id: 'ai',
      label: 'AI-handled',
      color: 'bg-violet-500',
      value: hover ? String(hover.ai) : undefined,
      active: showAI,
      onToggle: onToggleAI,
    },
  ];

  return (
    <div className="im-card p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Incident Trend</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Volume over time, with AI-handled share.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3" aria-hidden />
          Trending up
        </div>
      </div>

      <ChartLegend items={legend} className="mb-3" />

      <div className="relative">
        <svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
          className="block"
        >
          <defs>
            <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trend-ai-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid lines */}
          {yTicks.map((tick: { y: number; v: number }, i: number) => (
            <line
              key={i}
              x1={PAD_X}
              x2={width - PAD_X}
              y1={tick.y}
              y2={tick.y}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          {/* AI area + line */}
          {showAI ? (
            <>
              <path d={aiPath.area} fill="url(#trend-ai-area)" />
              <path
                d={aiPath.line}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : null}

          {/* Total area + line */}
          {showTotal ? (
            <>
              <path d={totalPath.area} fill="url(#trend-area)" />
              <path
                d={totalPath.line}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : null}

          {/* Hover guide */}
          {hoverX != null ? (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD_Y_TOP}
              y2={HEIGHT - PAD_Y_BOTTOM}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          ) : null}

          {/* Hover dots */}
          {hover != null && hoverIdx != null ? (
            <>
              {showTotal ? (
                <circle
                  cx={PAD_X + hoverIdx * xStep}
                  cy={
                    PAD_Y_TOP +
                    (1 - hover.total / maxValue) *
                      (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM)
                  }
                  r="4"
                  fill="white"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
              ) : null}
              {showAI ? (
                <circle
                  cx={PAD_X + hoverIdx * xStep}
                  cy={
                    PAD_Y_TOP +
                    (1 - hover.ai / maxValue) *
                      (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM)
                  }
                  r="4"
                  fill="white"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                />
              ) : null}
            </>
          ) : null}

          {/* X-axis labels */}
          {xLabels.map((x: { idx: number; label: string }) => (
            <text
              key={x.idx}
              x={PAD_X + x.idx * xStep}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#94A3B8"
              className="font-mono"
            >
              {x.label}
            </text>
          ))}
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute left-0 top-0"
            style={{
              transform: `translateX(calc(${hoverX ?? 0}px - 50%)) translateY(-8px)`,
            }}
          >
            <ChartTooltip
              title={hover.label}
              rows={[
                showTotal
                  ? { label: 'Total', value: String(hover.total), color: 'bg-blue-600' }
                  : null,
                showAI
                  ? { label: 'AI-handled', value: String(hover.ai), color: 'bg-violet-500' }
                  : null,
              ].filter((r): r is NonNullable<typeof r> => r != null)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
