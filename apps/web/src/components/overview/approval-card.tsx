'use client';

// Approval card — compact, single-row, stacked vertically in the
// parent. Reduces height ~35% vs the previous layout by moving
// metadata to a single header line and keeping the recommendation
// to two lines. Approve / Reject are persistent; a decision
// replaces them with a status + Undo.

import Link from 'next/link';
import { useState } from 'react';
import { Check, RotateCcw, Server, X } from 'lucide-react';
import type { IncidentSeverity } from '@incidentmind/shared';
import { cn } from '@/lib/utils';
import type { ApprovalDecision, OverviewApproval } from '@/lib/overview-data';
import { getDemoIncident } from '@/lib/demo-incidents';

interface ApprovalCardProps {
  approval: OverviewApproval;
}

const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; chip: string; bar: string }
> = {
  critical: { label: 'P1', chip: 'bg-rose-50 text-rose-700',    bar: 'bg-rose-500' },
  high:     { label: 'P2', chip: 'bg-orange-50 text-orange-700', bar: 'bg-orange-500' },
  medium:   { label: 'P3', chip: 'bg-amber-50 text-amber-700',   bar: 'bg-amber-500' },
  low:      { label: 'P4', chip: 'bg-sky-50 text-sky-700',       bar: 'bg-sky-500' },
};

function severityOf(s: IncidentSeverity): { label: string; chip: string; bar: string } {
  return SEVERITY_META[s]!;
}

export function ApprovalCard({ approval }: ApprovalCardProps): JSX.Element {
  const [decision, setDecision] = useState<ApprovalDecision>(approval.initialDecision);
  const sev = severityOf(approval.severity);
  const incident = getDemoIncident(approval.incidentId);
  const confidence = incident?.summary.aiConfidence ?? null;

  return (
    <article
      className={cn(
        'relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200',
        'hover:border-slate-300',
        decision === 'approved' && 'bg-emerald-50/20',
        decision === 'rejected' && 'bg-rose-50/20',
      )}
    >
      {/* Severity left bar */}
      <span
        aria-hidden
        className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', sev.bar)}
      />

      {/* Header line: severity · service · title · waiting time */}
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1.5 text-xs text-slate-500">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            sev.chip,
          )}
        >
          {sev.label}
        </span>
        <span className="inline-flex items-center gap-1">
          <Server className="h-3 w-3" aria-hidden />
          <span className="font-mono text-[11px]">{approval.service}</span>
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-[11px]">Waiting {approval.waitingSince}</span>
        {confidence !== null ? (
          <>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-700">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-blue-500"
              />
              {confidence}% AI confidence
            </span>
          </>
        ) : null}
        <DecisionBadge decision={decision} className="ml-auto" />
      </header>

      {/* Title */}
      <h3 className="pl-1.5 text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
        {approval.incidentTitle}
      </h3>

      {/* Recommendation + short explanation in two columns */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-1 pl-1.5 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Recommendation
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-700">
            {approval.recommendation}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Why
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
            {approval.rationale}
          </p>
        </div>
      </div>

      {/* Actions */}
      <footer className="flex items-center justify-end gap-2 pl-1.5 pt-1">
        {true ? (
          <>
           <Link
            href={`/incidents/${approval.incidentId}`}
            className="mr-auto inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
          >
            Open Incident
          </Link>
            <button
              type="button"
              onClick={() => setDecision('rejected')}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition-all hover:-translate-y-px hover:bg-rose-50 active:translate-y-0"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setDecision('approved')}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition-all hover:-translate-y-px hover:bg-blue-700 active:translate-y-0"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Approve
            </button>
          </>
        ) : (
          <>
            <p
              className={cn(
                'mr-auto text-xs font-medium',
                decision === 'approved' ? 'text-emerald-700' : 'text-rose-700',
              )}
            >
              {decision === 'approved'
                ? 'Approved · action will be queued for execution'
                : 'Rejected · AI will re-plan'}
            </p>
            <button
              type="button"
              onClick={() => setDecision('pending')}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Undo
            </button>
          </>
        )}
      </footer>
    </article>
  );
}

function DecisionBadge({
  decision,
  className,
}: {
  decision: ApprovalDecision;
  className?: string;
}): JSX.Element {
  if (decision === 'pending') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700',
          className,
        )}
      >
        <span className="pulse-success h-1.5 w-1.5 rounded-full bg-amber-500" />
        Awaiting You
      </span>
    );
  }
  if (decision === 'approved') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700',
          className,
        )}
      >
        <Check className="h-3 w-3" aria-hidden />
        Approved
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700',
        className,
      )}
    >
      <X className="h-3 w-3" aria-hidden />
      Rejected
    </span>
  );
}
