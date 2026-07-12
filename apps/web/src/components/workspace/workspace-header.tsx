'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Cpu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelative, formatDateTime } from '@/lib/format';
import type { IncidentSeverity, IncidentStatus } from '@incidentmind/shared';
import type { ApprovalDecision } from '@/lib/overview-data';
import type { DemoIncident } from '@/lib/demo-incidents';

interface WorkspaceHeaderProps {
  incident: DemoIncident;
  approval: ApprovalDecision;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
}

const SEVERITY_META: Record<IncidentSeverity, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'bg-rose-50 text-rose-700' },
  high:     { label: 'High',     classes: 'bg-orange-50 text-orange-700' },
  medium:   { label: 'Medium',   classes: 'bg-amber-50 text-amber-700' },
  low:      { label: 'Low',      classes: 'bg-sky-50 text-sky-700' },
};

const STATUS_META: Record<IncidentStatus, { label: string; classes: string }> = {
  open:          { label: 'Open',          classes: 'bg-rose-50 text-rose-700' },
  investigating: { label: 'Investigating', classes: 'bg-amber-50 text-amber-700' },
  mitigated:     { label: 'Mitigated',     classes: 'bg-sky-50 text-sky-700' },
  resolved:      { label: 'Resolved',      classes: 'bg-emerald-50 text-emerald-700' },
};

const APPROVAL_META: Record<ApprovalDecision, { label: string; classes: string }> = {
  pending:  { label: 'Awaiting decision', classes: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved',          classes: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected',          classes: 'bg-rose-50 text-rose-700' },
};

function sevFor(severity: IncidentSeverity): { label: string; classes: string } {
  return SEVERITY_META[severity]!;
}
function statusFor(status: IncidentStatus): { label: string; classes: string } {
  return STATUS_META[status]!;
}

export function WorkspaceHeader({
  incident,
  approval,
  onApprove,
  onReject,
  onReset,
}: WorkspaceHeaderProps): JSX.Element {
  const sev = sevFor(incident.summary.severity);
  const status = statusFor(incident.summary.status);
  const ap = APPROVAL_META[approval];
  const confidence = incident.summary.aiConfidence ?? 0;

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to Overview
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                sev.classes,
              )}
            >
              {sev.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                status.classes,
              )}
            >
              {status.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                ap.classes,
              )}
            >
              {approval === 'approved' ? (
                <CheckCircle2 className="h-3 w-3" aria-hidden />
              ) : approval === 'rejected' ? (
                <X className="h-3 w-3" aria-hidden />
              ) : null}
              {ap.label}
            </span>
          </div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[28px]">
            {incident.summary.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span>
              Started{' '}
              <span suppressHydrationWarning>
                {formatRelative(incident.summary.startedAt)}
              </span>{' '}
              ·{' '}
              <span suppressHydrationWarning className="font-mono tabular-nums">
                {formatDateTime(incident.summary.startedAt)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Cpu className="h-3 w-3" aria-hidden />
              <span className="font-mono">{incident.summary.service}</span>
            </span>
            <span className="capitalize">{incident.summary.environment}</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation CTA card */}
      <div className="im-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700">
                AI Recommendation Ready
              </p>
              <p className="mt-0.5 text-base font-semibold text-slate-900">
                {incident.recommendation.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {incident.recommendation.estimatedRecovery} ·{' '}
                {incident.recommendation.risk} risk ·{' '}
                {incident.recommendation.reason}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Confidence
              </span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
                {confidence}%
              </span>
            </div>
            {approval === 'pending' ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="rounded-md bg-blue-600 px-4 text-white transition-all hover:-translate-y-px hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  className="rounded-md border-rose-200 px-4 text-rose-600 transition-all hover:-translate-y-px hover:bg-rose-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold',
                    ap.classes,
                  )}
                >
                  {approval === 'approved' ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                  ) : (
                    <X className="h-3 w-3" aria-hidden />
                  )}
                  {ap.label}
                </span>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          The system will not deploy any action without your approval.
        </p>
      </div>
    </div>
  );
}
