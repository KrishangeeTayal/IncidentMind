'use client';

// Average Resolution Time — grouped bar chart, grouped by severity,
// comparing AI-assisted vs manual resolution.

import { useMemo, useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartTooltip } from './chart-tooltip';
import { ChartLegend, type ChartLegendItem } from './chart-legend';
import type { ResolutionTimeGroup } from '@/lib/analytics-data';

interface ResolutionTimeChartProps {
  data: ResolutionTimeGroup[];
}

const HEIGHT = 240;
const PAD_X = 28;
const PAD_Y_TOP = 24;
const PAD_Y_BOTTOM = 28;

const SEVERITY_LABEL: Record<ResolutionTimeGroup['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const SEVERITY_COLOR: Record<ResolutionTimeGroup['severity'], string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#0EA5E9',
};

export function ResolutionTimeChart({ data }: ResolutionTimeChartProps): JSX.Element {
  const [width, setWidth] = useState(640);
  const [showAI, setShowAI] = useState(true);
  const [showManual, setShowManual] = useState(true);
  const [hoverGroup, setHoverGroup] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    const all = data.flatMap((d) => [d.aiAssistedMinutes, d.manualMinutes]);
    return Math.max(1, ...all) * 1.1;
  }, [data]);

  const groupWidth =
    data.length > 0
      ? (width - PAD_X * 2) / data.length
      : 0;
  const barWidth = 18;
  const groupGap = 8;

  const yTicks = useMemo(() => {
    return [0, 0.5, 1].map((t) => ({
      y: PAD_Y_TOP + t * (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM),
      v: Math.round(maxValue * (1 - t)),
    }));
  }, [maxValue]);

  function handleMove(e: React.MouseEvent<SVGSVGElement>): void {
    if (data.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.floor((xRel - PAD_X) / groupWidth);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setHoverGroup(clamped);
  }

  const legend: ChartLegendItem[] = [
    {
      id: 'ai',
      label: 'AI-assisted',
      color: 'bg-violet-500',
      active: showAI,
      onToggle: () => setShowAI((v: boolean) => !v),
    },
    {
      id: 'manual',
      label: 'Manual',
      color: 'bg-slate-400',
      active: showManual,
      onToggle: () => setShowManual((v: boolean) => !v),
    },
  ];

  return (
    <div className="im-card p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Average Resolution Time
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Mean time to resolution, grouped by severity, AI-assisted vs manual.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Clock className="h-3 w-3" aria-hidden />
          minutes
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
          onMouseLeave={() => setHoverGroup(null)}
          className="block"
        >
          {/* Y grid */}
          {yTicks.map((t: { y: number; v: number }, i: number) => (
            <line
              key={i}
              x1={PAD_X}
              x2={width - PAD_X}
              y1={t.y}
              y2={t.y}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          {data.map((group, i) => {
            const groupX = PAD_X + i * groupWidth + groupGap;
            const innerWidth = groupWidth - groupGap * 2;
            const barSpacing = 4;
            const totalBarWidth = barWidth * 2 + barSpacing;
            const leftPad = (innerWidth - totalBarWidth) / 2;

            const aiY =
              PAD_Y_TOP +
              (1 - group.aiAssistedMinutes / maxValue) *
                (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM);
            const aiH = HEIGHT - PAD_Y_BOTTOM - aiY;

            const manualY =
              PAD_Y_TOP +
              (1 - group.manualMinutes / maxValue) *
                (HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM);
            const manualH = HEIGHT - PAD_Y_BOTTOM - manualY;

            const isHover = hoverGroup === i;
            const dim = hoverGroup != null && !isHover;

            return (
              <g key={group.severity}>
                {/* AI-assisted bar (violet) */}
                {showAI ? (
                  <g>
                    <rect
                      x={groupX + leftPad}
                      y={aiY}
                      width={barWidth}
                      height={aiH}
                      rx="3"
                      fill="#8B5CF6"
                      opacity={dim ? 0.35 : 1}
                      className="transition-opacity"
                    />
                    <text
                      x={groupX + leftPad + barWidth / 2}
                      y={aiY - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="#7C3AED"
                      className="font-mono"
                    >
                      {group.aiAssistedMinutes}m
                    </text>
                  </g>
                ) : null}

                {/* Manual bar (slate) */}
                {showManual ? (
                  <g>
                    <rect
                      x={groupX + leftPad + barWidth + barSpacing}
                      y={manualY}
                      width={barWidth}
                      height={manualH}
                      rx="3"
                      fill="#94A3B8"
                      opacity={dim ? 0.35 : 1}
                      className="transition-opacity"
                    />
                    <text
                      x={groupX + leftPad + barWidth + barSpacing + barWidth / 2}
                      y={manualY - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="#475569"
                      className="font-mono"
                    >
                      {group.manualMinutes}m
                    </text>
                  </g>
                ) : null}

                {/* Severity label */}
                <text
                  x={groupX + innerWidth / 2}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="500"
                  fill={SEVERITY_COLOR[group.severity]}
                  className="font-sans"
                >
                  {SEVERITY_LABEL[group.severity]}
                </text>

                {/* Group hover hit area */}
                <rect
                  x={groupX}
                  y={PAD_Y_TOP}
                  width={innerWidth}
                  height={HEIGHT - PAD_Y_TOP - PAD_Y_BOTTOM}
                  fill="transparent"
                  onMouseEnter={() => setHoverGroup(i)}
                />
              </g>
            );
          })}
        </svg>

        {hoverGroup != null && data[hoverGroup] ? (
          (() => {
            const g = data[hoverGroup]!;
            const groupX = PAD_X + hoverGroup * groupWidth + groupGap;
            const innerWidth = groupWidth - groupGap * 2;
            const totalBarWidth = barWidth * 2 + 4;
            const leftPad = (innerWidth - totalBarWidth) / 2;
            const tooltipX = groupX + innerWidth / 2;
            return (
              <div
                className="pointer-events-none absolute left-0 top-0"
                style={{
                  transform: `translateX(calc(${tooltipX}px - 50%)) translateY(-8px)`,
                }}
              >
                <ChartTooltip
                  title={SEVERITY_LABEL[g.severity] ?? g.severity}
                  rows={[
                    showAI
                      ? {
                          label: 'AI-assisted',
                          value: `${g.aiAssistedMinutes} min`,
                          color: 'bg-violet-500',
                        }
                      : null,
                    showManual
                      ? {
                          label: 'Manual',
                          value: `${g.manualMinutes} min`,
                          color: 'bg-slate-400',
                        }
                      : null,
                    showAI && showManual
                      ? {
                          label: 'Time saved',
                          value: `${Math.max(0, g.manualMinutes - g.aiAssistedMinutes)} min`,
                        }
                      : null,
                  ].filter((r): r is NonNullable<typeof r> => r != null)}
                />
              </div>
            );
          })()
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" aria-hidden />
        <p className="text-xs text-violet-700">
          AI-assisted resolution is consistently faster across every severity level.
        </p>
      </div>
    </div>
  );
}
