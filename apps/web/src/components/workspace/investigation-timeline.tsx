'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, Clock, Sparkles } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type { TimelineStep, TimelineStepState } from '@/lib/demo-incidents';

interface InvestigationTimelineProps {
  steps: TimelineStep[];
  /** Active step that should be highlighted on the page. */
  activeStepId?: string;
}

export function InvestigationTimeline({
  steps,
  activeStepId,
}: InvestigationTimelineProps): JSX.Element {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    // Open the active step + any "done" step by default.
    const initial = new Set<string>();
    for (const s of steps) {
      if (s.state === 'active' || s.state === 'done') initial.add(s.id);
    }
    return initial;
  });

  const toggle = (id: string): void => {
    setOpenIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStepClick = (step: TimelineStep): void => {
    // Auto-open the step on click.
    setOpenIds((prev: Set<string>) => {
      if (prev.has(step.id)) return prev;
      const next = new Set(prev);
      next.add(step.id);
      return next;
    });
    // Scroll to the corresponding section.
    if (step.scrollTarget) {
      const el = document.getElementById(step.scrollTarget);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      id="section-timeline"
      aria-labelledby="section-timeline-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={1}
        title="Investigation Timeline"
        subtitle="7-step workflow · click a step to expand or jump to its section"
        icon={Clock}
        id="section-timeline"
      />

      <ol className="mt-5 space-y-0">
        {steps.map((step, idx) => {
          const isOpen = openIds.has(step.id);
          const isActive = step.id === activeStepId || step.state === 'active';
          return (
            <li
              key={step.id}
              className={cn(
                'group rounded-xl border transition-all duration-200',
                isActive
                  ? 'border-violet-200 bg-violet-50/30 shadow-sm'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50/40',
                idx > 0 && 'mt-2',
              )}
            >
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
                aria-expanded={isOpen}
              >
                <StepMarker state={step.state} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight',
                        step.state === 'pending' ? 'text-slate-400' : 'text-slate-900',
                      )}
                    >
                      {step.label}
                    </span>
                    {step.completedAt ? (
                      <span className="font-mono text-[10px] tabular-nums text-slate-400">
                        {step.completedAt}
                      </span>
                    ) : null}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-700">
                        <span className="h-1 w-1 rounded-full bg-violet-500" />
                        Active
                      </span>
                    ) : null}
                  </div>
                  {step.completedAt ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Completed at {step.completedAt}
                    </p>
                  ) : step.startedAt ? (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Started at {step.startedAt}
                    </p>
                  ) : null}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-400 transition-transform duration-200',
                    isOpen && 'rotate-180 text-slate-700',
                  )}
                  aria-hidden
                />
              </button>

              {isOpen ? (
                <div className="border-t border-slate-100/80 bg-white/50 px-3 pb-3 pt-3">
                  <ul className="space-y-1.5">
                    {step.details.map((d, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-1 w-1 shrink-0 rounded-full',
                            isActive ? 'bg-violet-500' : 'bg-slate-400',
                          )}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StepMarker({ state }: { state: TimelineStepState }): JSX.Element {
  if (state === 'done') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-30" />
        <Sparkles className="relative h-3.5 w-3.5" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
      <Circle className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}
