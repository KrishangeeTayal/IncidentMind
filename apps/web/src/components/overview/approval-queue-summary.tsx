'use client';

// Approval Queue Summary — a compact, horizontal summary card that
// sits above the stacked approval cards. Aggregates the four numbers
// the on-call engineer needs at a glance: how many, how old, how
// risky, how confident the AI is.

import { useMemo } from 'react';
import { AlertTriangle, Clock, ListChecks, Sparkles } from 'lucide-react';
import type { IncidentSeverity } from '@incidentmind/shared';
import { cn } from '@/lib/utils';
import { overviewApprovals, type OverviewApproval } from '@/lib/overview-data';
import { getDemoIncident } from '@/lib/demo-incidents';

function severityRank(s: IncidentSeverity): number {
  switch (s) {
    case 'critical': return 4;
    case 'high':     return 3;
    case 'medium':   return 2;
    case 'low':      return 1;
    default:         return 0;
  }
}

function severityTone(s: IncidentSeverity): { tint: string; text: string; label: string } {
  switch (s) {
    case 'critical': return { tint: 'bg-rose-50',    text: 'text-rose-600',    label: 'Critical' };
    case 'high':     return { tint: 'bg-orange-50',  text: 'text-orange-600',  label: 'High' };
    case 'medium':   return { tint: 'bg-amber-50',   text: 'text-amber-600',   label: 'Medium' };
    case 'low':      return { tint: 'bg-sky-50',     text: 'text-sky-600',     label: 'Low' };
    default:         return { tint: 'bg-slate-50',   text: 'text-slate-500',   label: 'Unknown' };
  }
}

function parseWaitingMinutes(text: string): number {
  // "4 min ago" -> 4
  const match = text.match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : 0;
}

interface Summary {
  pendingCount: number;
  averageWaitingMinutes: number;
  highestSeverity: IncidentSeverity | null;
  averageConfidence: number;
}

function computeSummary(approvals: OverviewApproval[]): Summary {
  const pending = approvals.filter(
    (a) => a.initialDecision === 'pending',
  );
  const waitingTimes = pending.map((a) => parseWaitingMinutes(a.waitingSince));
  const averageWaitingMinutes = waitingTimes.length
    ? Math.round(
        waitingTimes.reduce((acc, n) => acc + n, 0) / waitingTimes.length,
      )
    : 0;

  let highestSeverity: IncidentSeverity | null = null;
  for (const a of pending) {
    if (highestSeverity === null) {
      highestSeverity = a.severity;
      continue;
    }
    if (severityRank(a.severity) > severityRank(highestSeverity)) {
      highestSeverity = a.severity;
    }
  }

  const confidences = pending
    .map((a) => getDemoIncident(a.incidentId)?.summary.aiConfidence ?? null)
    .filter((c): c is number => c !== null);

  const averageConfidence = confidences.length
    ? Math.round(
        confidences.reduce((acc, n) => acc + n, 0) / confidences.length,
      )
    : 0;

  return {
    pendingCount: pending.length,
    averageWaitingMinutes,
    highestSeverity,
    averageConfidence,
  };
}

export function ApprovalQueueSummary(): JSX.Element {
  const summary = useMemo(() => computeSummary(overviewApprovals), []);

  const waitingSubtext =
    summary.averageWaitingMinutes === 0
      ? 'No queue'
      : summary.averageWaitingMinutes <= 4
      ? 'Faster than average'
      : summary.averageWaitingMinutes <= 8
      ? 'On par'
      : 'Older than average';

  const confidenceSubtext =
    summary.averageConfidence >= 90
      ? 'Enkrypt approved'
      : summary.averageConfidence >= 75
      ? 'Manual review suggested'
      : 'High caution';

  return (
    <div className="im-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Approval Queue Summary
        </h3>
        <span className="text-[11px] text-slate-500">
          {summary.pendingCount} waiting on you
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <SummaryMetric
          icon={ListChecks}
          iconTone="bg-violet-50 text-violet-600"
          label="Pending Approvals"
          value={String(summary.pendingCount)}
          subtext="Awaiting review"
        />
        <SummaryMetric
          icon={Clock}
          iconTone="bg-amber-50 text-amber-600"
          label="Average Waiting Time"
          value={`${summary.averageWaitingMinutes} min`}
          subtext={waitingSubtext}
        />
        <SummaryMetric
          icon={AlertTriangle}
          iconTone={
            summary.highestSeverity
              ? severityTone(summary.highestSeverity).tint +
                ' ' +
                severityTone(summary.highestSeverity).text
              : 'bg-slate-50 text-slate-500'
          }
          label="Highest Severity"
          value={
            summary.highestSeverity
              ? severityTone(summary.highestSeverity).label
              : '—'
          }
          subtext="Oldest in queue"
        />
        <SummaryMetric
          icon={Sparkles}
          iconTone="bg-violet-50 text-violet-600"
          label="Average AI Confidence"
          value={`${summary.averageConfidence}%`}
          subtext={confidenceSubtext}
        />
      </div>
    </div>
  );
}

interface SummaryMetricProps {
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  label: string;
  value: string;
  subtext: string;
}

function SummaryMetric({
  icon: Icon,
  iconTone,
  label,
  value,
  subtext,
}: SummaryMetricProps): JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          iconTone,
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="font-mono text-lg font-semibold tabular-nums leading-tight text-slate-900">
          {value}
        </p>
        <p className="text-[11px] text-slate-500">{subtext}</p>
      </div>
    </div>
  );
}
