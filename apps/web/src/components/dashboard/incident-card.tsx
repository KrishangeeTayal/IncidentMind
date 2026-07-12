// Linear-style incident card for the live feed. Severity-colored
// left border, hover elevation, AI confidence chip.

import Link from 'next/link';
import { ArrowUpRight, Clock, Cpu, Sparkles } from 'lucide-react';
import type { Incident, IncidentSeverity, IncidentStatus } from '@incidentmind/shared';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';

interface IncidentCardProps {
  incident: Incident;
  /** AI confidence 0..100. If undefined, no confidence chip is shown. */
  aiConfidence?: number;
}

const SEVERITY_META: Record<
  IncidentSeverity,
  { label: string; bar: string; chip: string }
> = {
  critical: {
    label: 'Critical',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  high: {
    label: 'High',
    bar: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
  medium: {
    label: 'Medium',
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  low: {
    label: 'Low',
    bar: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
};

const STATUS_META: Record<IncidentStatus, { label: string; classes: string }> = {
  open: {
    label: 'Open',
    classes: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  investigating: {
    label: 'Investigating',
    classes: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  mitigated: {
    label: 'Mitigated',
    classes: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
};

export function IncidentCard({ incident, aiConfidence }: IncidentCardProps): JSX.Element {
  const sev = SEVERITY_META[incident.severity]!;
  const status = STATUS_META[incident.status]!;

  return (
    <Link
      href={`/incidents/${incident.id}` as Parameters<typeof Link>[0]['href']}
      className="group relative block overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-px hover:border-violet-200 hover:shadow-md"
    >
      {/* Severity left border */}
      <span
        aria-hidden
        className={cn('absolute inset-y-0 left-0 w-1', sev.bar)}
      />

      <div className="flex items-start gap-4 p-4 pl-5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1',
                sev.chip,
              )}
            >
              {sev.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1',
                status.classes,
              )}
            >
              {status.label}
            </span>
            {typeof aiConfidence === 'number' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-200">
                <Sparkles className="h-2.5 w-2.5" aria-hidden />
                AI {aiConfidence}%
              </span>
            ) : null}
          </div>

          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {incident.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Cpu className="h-3 w-3" aria-hidden />
              <span className="font-mono">{incident.service}</span>
            </span>
            <span className="capitalize">{incident.environment}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {formatRelative(incident.createdAt)}
            </span>
          </div>
        </div>

        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
          aria-hidden
        />
      </div>
    </Link>
  );
}
