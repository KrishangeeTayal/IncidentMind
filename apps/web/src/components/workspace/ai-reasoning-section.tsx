'use client';

import { Brain, Lightbulb, ShieldCheck } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type { AIReasoning } from '@/lib/demo-incidents';

interface AIReasoningSectionProps {
  reasoning: AIReasoning;
}

export function AIReasoningSection({
  reasoning,
}: AIReasoningSectionProps): JSX.Element {
  return (
    <section
      id="section-reasoning"
      aria-labelledby="section-reasoning-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={3}
        title="AI Reasoning"
        subtitle="How the AI reached its conclusion"
        icon={Brain}
        id="section-reasoning"
      />

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Observation
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
            {reasoning.observation}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Supporting Evidence
          </p>
          <ul className="mt-2 space-y-1.5">
            {reasoning.supportingEvidence.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            Confidence
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-3xl font-semibold tabular-nums text-slate-900">
              {reasoning.confidence}%
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full bg-blue-500 progress-fill"
                style={{ width: `${reasoning.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Why this conclusion?
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {reasoning.why}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        This reasoning has been audited by Enkrypt before being surfaced for
        human review.
      </p>
    </section>
  );
}

void Lightbulb;
