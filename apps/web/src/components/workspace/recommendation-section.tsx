'use client';

import { CheckCircle2, ChevronRight, ListChecks, ShieldCheck, X } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/lib/demo-incidents';
import type { ApprovalDecision } from '@/lib/overview-data';

interface RecommendationSectionProps {
  recommendation: Recommendation;
  approval: ApprovalDecision;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
}

const RISK_META: Record<
  Recommendation['risk'],
  { classes: string; dot: string }
> = {
  Low: { classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Medium: { classes: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  High: { classes: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  Critical: { classes: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
};

export function RecommendationSection({
  recommendation,
  approval,
  onApprove,
  onReject,
  onReset,
}: RecommendationSectionProps): JSX.Element {
  const risk = RISK_META[recommendation.risk];

  return (
    <section
      id="section-recommendation"
      aria-labelledby="section-recommendation-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={5}
        title="Recommendation"
        subtitle="AI-generated remediation plan · awaiting your decision"
        icon={ListChecks}
        id="section-recommendation"
        actions={
          approval !== 'pending' ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Reset
            </button>
          ) : null
        }
      />

      <div
        className={cn(
          'mt-5 rounded-2xl border bg-white p-5 transition-all duration-200',
          approval === 'approved' && 'border-emerald-200',
          approval === 'rejected' && 'border-rose-200',
          approval === 'pending' && 'border-slate-200',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              Recommended action
            </p>
            <h3 className="mt-1 text-xl font-semibold leading-snug tracking-tight text-slate-900">
              {recommendation.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">{recommendation.reason}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
            <Kpi label="Estimated Recovery" value={recommendation.estimatedRecovery} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Risk
              </p>
              <span
                className={cn(
                  'mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ',
                  risk.classes,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', risk.dot)} />
                {recommendation.risk}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Execution steps
          </p>
          <ol className="mt-2 space-y-1.5">
            {recommendation.steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 font-mono text-[9px] font-semibold text-blue-700">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <footer className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Reviewed by Enkrypt · awaiting your decision
          </p>
          {approval === 'pending' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Approve
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition-all hover:-translate-y-px hover:bg-rose-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Reject
              </button>
            </div>
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ',
                approval === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700',
              )}
            >
              {approval === 'approved' ? (
                <CheckCircle2 className="h-3 w-3" aria-hidden />
              ) : (
                <X className="h-3 w-3" aria-hidden />
              )}
              {approval === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </footer>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
