'use client';

// AI Investigation Engine — right column. Shows current incident,
// current step, confidence, ETA, recommendation status, and the
// vertical workflow visualization. Not a chatbot.

import { useEffect, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { overviewInvestigation, type OverviewWorkflowStep } from '@/lib/overview-data';
import { cn } from '@/lib/utils';

export function AIInvestigationEngine(): JSX.Element {
  const inv = overviewInvestigation;
  const activeStep = inv.steps.find((s) => s.state === 'active');
  const [eta, setEta] = useState(inv.estimatedSeconds);

  // Tick the ETA down by 1 every second; reset when it hits 0.
  useEffect(() => {
    if (!activeStep) return;
    const id = setInterval(() => {
      setEta((e: number) => (e <= 1 ? inv.estimatedSeconds : e - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [activeStep, inv.estimatedSeconds]);

  return (
    <section
      aria-label="AI Investigation Engine"
      className="flex h-full flex-col im-card p-5"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
            <Brain className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              AI Investigation Engine
            </h2>
            <p className="text-[11px] text-slate-500">Multi-agent workflow</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          Running
        </span>
      </header>

      {/* Current incident */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Current Incident
          </p>
          <SeverityChip severity={inv.severity} />
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {inv.incidentTitle}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
          {inv.service}
        </p>
      </div>

      {/* Metrics grid */}
      <dl className="mt-3 grid grid-cols-2 gap-2.5">
        <Metric
          label="Current Step"
          value={
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
              {activeStep?.label ?? inv.currentStep}
            </span>
          }
        />
        <Metric
          label="Confidence"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-mono tabular-nums text-slate-900">
                {inv.confidence}%
              </span>
              <ConfidenceBar value={inv.confidence} />
            </span>
          }
        />
        <Metric
          label="Estimated Completion"
          value={
            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
              <Clock className="h-3 w-3 text-slate-400" />
              {eta}s
            </span>
          }
        />
        <Metric
          label="Recommendation"
          value={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              {inv.recommendationStatus}
            </span>
          }
        />
      </dl>

      {/* Root cause callout */}
      <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-violet-700">
          Root cause (preliminary)
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          {inv.rootCause}
        </p>
      </div>

      {/* Workflow steps */}
      <ol className="mt-4 space-y-1.5">
        {inv.steps.map((step, idx) => (
          <WorkflowRow key={step.id} step={step} isLast={idx === inv.steps.length - 1} />
        ))}
      </ol>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <dt className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }): JSX.Element {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full bg-emerald-500 progress-fill"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SeverityChip({
  severity,
}: {
  severity: 'critical' | 'high' | 'medium' | 'low';
}): JSX.Element {
  const meta: Record<typeof severity, { label: string; classes: string }> = {
    critical: {
      label: 'P1',
      classes: 'bg-rose-50 text-rose-700 ring-rose-200',
    },
    high: {
      label: 'P2',
      classes: 'bg-orange-50 text-orange-700 ring-orange-200',
    },
    medium: {
      label: 'P3',
      classes: 'bg-amber-50 text-amber-700 ring-amber-200',
    },
    low: {
      label: 'P4',
      classes: 'bg-sky-50 text-sky-700 ring-sky-200',
    },
  };
  const m = meta[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1',
        m.classes,
      )}
    >
      {m.label}
    </span>
  );
}

function WorkflowRow({
  step,
  isLast,
}: {
  step: OverviewWorkflowStep;
  isLast: boolean;
}): JSX.Element {
  const isDone = step.state === 'done';
  const isActive = step.state === 'active';

  return (
    <li className="flex items-stretch gap-2.5">
      <div className="flex flex-col items-center pt-0.5">
        {isDone ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
          </span>
        ) : isActive ? (
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-1 ring-violet-200">
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-400 opacity-30" />
            <Sparkles className="relative h-2.5 w-2.5" aria-hidden />
          </span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
            <Circle className="h-2.5 w-2.5" aria-hidden />
          </span>
        )}
        {!isLast ? (
          <span
            aria-hidden
            className={cn(
              'mt-0.5 w-px flex-1',
              isDone ? 'bg-emerald-200' : isActive ? 'bg-violet-200' : 'bg-slate-200',
            )}
          />
        ) : null}
      </div>
      <div className="flex-1 pb-2.5">
        <p
          className={cn(
            'text-[13px] font-medium leading-tight',
            isActive ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400',
          )}
        >
          {step.label}
        </p>
        {step.detail ? (
          <p
            className={cn(
              'mt-0.5 text-[11px]',
              isActive ? 'text-violet-700' : 'text-slate-500',
            )}
          >
            {step.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}
