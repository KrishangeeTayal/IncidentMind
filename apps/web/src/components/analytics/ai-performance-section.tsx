'use client';

// AI Performance — four metric cards with trend indicators.
// Uses a compact card style (different from the bigger Overview KPI
// card) so the section doesn't compete with the row above.

import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AIPerformance as AIPerf, type TimeRange } from '@/lib/analytics-data';

interface AIPerformanceSectionProps {
  performance: AIPerf;
  /** Re-key the section so cards animate in on range change. */
  rangeKey: TimeRange;
}

interface MetricConfig {
  key: keyof AIPerf['trends'];
  label: string;
  value: string;
  trend: number;
  good: 'up' | 'down';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'info' | 'success' | 'warning' | 'critical';
}

function buildCards(p: AIPerf): MetricConfig[] {
  return [
    {
      key: 'recommendations',
      label: 'Recommendations Generated',
      value: p.recommendations.toLocaleString(),
      trend: p.trends.recommendations,
      good: 'up',
      description: 'AI-suggested mitigations issued this period.',
      icon: Sparkles,
      tone: 'info',
    },
    {
      key: 'approvalRate',
      label: 'Human Approval Rate',
      value: `${p.approvalRate}%`,
      trend: p.trends.approvalRate,
      good: 'up',
      description: 'Of recommendations approved by humans.',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      key: 'averageConfidence',
      label: 'Average Confidence',
      value: `${p.averageConfidence}%`,
      trend: p.trends.averageConfidence,
      good: 'up',
      description: 'Mean confidence score across all recommendations.',
      icon: Brain,
      tone: 'info',
    },
    {
      key: 'falsePositiveRate',
      label: 'False Positive Rate',
      value: `${p.falsePositiveRate}%`,
      trend: p.trends.falsePositiveRate,
      good: 'down',
      description: 'Recommendations reverted by humans.',
      icon: XCircle,
      tone: 'success',
    },
  ];
}

const TONE: Record<MetricConfig['tone'], { tint: string; text: string }> = {
  info:     { tint: 'bg-blue-50',    text: 'text-blue-600' },
  success:  { tint: 'bg-emerald-50', text: 'text-emerald-600' },
  warning:  { tint: 'bg-amber-50',   text: 'text-amber-600' },
  critical: { tint: 'bg-rose-50',    text: 'text-rose-600' },
};

export function AIPerformanceSection({
  performance,
  rangeKey,
}: AIPerformanceSectionProps): JSX.Element {
  const cards = buildCards(performance);

  return (
    <section
      key={rangeKey}
      aria-label="AI performance"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
            AI Performance
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            How the on-call AI is performing across the platform.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const tone = TONE[card.tone];
          const isGood =
            (card.good === 'up' && card.trend >= 0) ||
            (card.good === 'down' && card.trend < 0);
          const TrendIcon = card.trend >= 0 ? ArrowUpRight : ArrowDownRight;
          const trendTone = isGood
            ? 'text-emerald-600'
            : 'text-rose-600';

          return (
            <li
              key={card.key}
              className={cn(
                'rounded-xl border border-slate-200/80 bg-white p-4',
                'transition-colors hover:border-slate-300',
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                    tone.tint,
                  )}
                  aria-hidden
                >
                  <Icon className={cn('h-4 w-4', tone.text)} />
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
                    isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                  )}
                >
                  <TrendIcon className="h-3 w-3" aria-hidden />
                  {Math.abs(card.trend).toFixed(1)}%
                </span>
              </div>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{card.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
