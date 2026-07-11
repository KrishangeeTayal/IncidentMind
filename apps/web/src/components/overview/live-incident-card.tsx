'use client';

// Modern issue card for the Live Production Incidents column.
// White card with thin border, severity left border, hover lift.

import Link from 'next/link';
import { ArrowUpRight, Clock, Cpu, Sparkles } from 'lucide-react';
import type { IncidentSeverity, IncidentStatus } from '@incidentmind/shared';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';

interface LiveIncidentCardProps {
  id: string;
  title: string;
  service: string;
  environment: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  aiConfidence: number | null;
  timeLabel: string;
  /** Optional fixed seconds-ago value; if provided, the card will tick up. */
  secondsAgo?: number;
}

const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; bar: string; chip: string }
> = {
  critical: {
    label: 'Critical',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700',
  },
  high: {
    label: 'High',
    bar: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700',
  },
  medium: {
    label: 'Medium',
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700',
  },
  low: {
    label: 'Low',
    bar: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700',
  },
};

const STATUS_META: Record<IncidentStatus, { label: string; classes: string }> = {
  open: {
    label: 'Open',
    classes: 'bg-rose-50 text-rose-700',
  },
  investigating: {
    label: 'Investigating',
    classes: 'bg-amber-50 text-amber-700',
  },
  mitigated: {
    label: 'Mitigated',
    classes: 'bg-sky-50 text-sky-700',
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-700',
  },
};

const TIME_NOW = () => Date.now();

export function LiveIncidentCard({
  id,
  title,
  service,
  environment,
  severity,
  status,
  aiConfidence,
  timeLabel,
  secondsAgo,
}: LiveIncidentCardProps): JSX.Element {
  const sev = SEVERITY_META[severity]!;
  const st = STATUS_META[status]!;

  // Live "X ago" — recomputed only if secondsAgo is provided.
  const liveTime =
    secondsAgo !== undefined
      ? formatRelative(new Date(TIME_NOW() - secondsAgo * 1000).toISOString())
      : timeLabel;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 pl-5 shadow-[0_1px_2px_0_rgb(15_23_42_/_0.04)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
      )}
    >
      {/* Severity left bar */}
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', sev.bar)} />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              sev.chip,
            )}
          >
            {sev.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              st.classes,
            )}
          >
            {st.label}
          </span>
          {aiConfidence !== null ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
              <Sparkles className="h-2.5 w-2.5" aria-hidden />
              AI {aiConfidence}%
            </span>
          ) : null}
        </div>

        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" aria-hidden />
            <span className="font-mono">{service}</span>
          </span>
          <span className="capitalize">{environment}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            <span suppressHydrationWarning>{liveTime}</span>
          </span>
        </div>
      </div>

      <Link
        href={`/incidents/${id}` as Parameters<typeof Link>[0]['href']}
        className="inline-flex shrink-0 items-center gap-1 self-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-slate-800"
      >
        Open
        <ArrowUpRight className="h-3 w-3" aria-hidden />
      </Link>
    </div>
  );
}
