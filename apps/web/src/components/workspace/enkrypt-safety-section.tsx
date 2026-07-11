'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type { EnkryptSafety } from '@/lib/demo-incidents';

interface EnkryptSafetySectionProps {
  safety: EnkryptSafety;
}

export function EnkryptSafetySection({
  safety,
}: EnkryptSafetySectionProps): JSX.Element {
  return (
    <section
      id="section-enkrypt"
      aria-labelledby="section-enkrypt-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={6}
        title="Enkrypt Safety Evaluation"
        subtitle="Independent audit of the AI output before human review"
        icon={ShieldCheck}
        id="section-enkrypt"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Safety Score"
          value={safety.safetyScore}
          tone="good"
        />
        <Metric
          label="Hallucination Risk"
          value={safety.hallucinationRisk}
          tone={safety.hallucinationRisk > 30 ? 'bad' : 'good'}
          inverted
        />
        <Metric
          label="Evidence Coverage"
          value={safety.evidenceCoverage}
          tone="good"
        />
        <DecisionCard decision={safety.decision} note={safety.note} />
      </div>
    </section>
  );
}

interface MetricProps {
  label: string;
  value: number;
  tone: 'good' | 'bad';
  /** If true, lower is better (e.g. hallucination risk). */
  inverted?: boolean;
}

function Metric({ label, value, tone, inverted }: MetricProps): JSX.Element {
  // For inverted metrics, flip the color band.
  const isGood = inverted ? value < 30 : value > 75;
  const ringColor = isGood ? 'ring-emerald-100' : tone === 'bad' ? 'ring-rose-100' : 'ring-slate-200';
  const barColor = isGood ? 'bg-emerald-500' : 'bg-rose-500';
  const valueColor = isGood ? 'text-emerald-700' : 'text-rose-600';

  return (
    <div className={cn('im-card p-4', ringColor)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ',
            isGood
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700',
          )}
        >
          {isGood ? 'Pass' : 'Flag'}
        </span>
      </div>
      <p className={cn('mt-1.5 font-mono text-2xl font-semibold tabular-nums', valueColor)}>
        {value}
        <span className="ml-0.5 text-base font-medium text-slate-400">/100</span>
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full progress-fill', barColor)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function DecisionCard({
  decision,
  note,
}: {
  decision: string;
  note?: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        Decision
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        {decision}
      </p>
      {note ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{note}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        <ShieldAlert className="h-3 w-3" aria-hidden />
        Audit log retained 7 years
      </div>
    </div>
  );
}
