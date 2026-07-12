'use client';

// Active Incidents — table-style list for the Dashboard. 5 columns
// plus actions. Each row has a coloured left bar by severity, a bell
// icon in a tinted container, severity badge, AI status with dot,
// and a dark "Review" or outlined "View" CTA on the right.

import { Bell, MoreHorizontal, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { overviewIncidents } from '@/lib/overview-data';

interface ActiveIncidentsTableProps {
  /** Max number of rows to render. Defaults to 4. */
  limit?: number;
  className?: string;
}

type SevKey = 'critical' | 'high' | 'medium' | 'low';
const SEVERITY_META: { [K in SevKey]: { label: string; bar: string; chip: string } } = {
  critical: { label: 'Critical', bar: 'bg-rose-500',    chip: 'bg-rose-50 text-rose-700' },
  high:     { label: 'High',     bar: 'bg-orange-500',  chip: 'bg-orange-50 text-orange-700' },
  medium:   { label: 'Medium',   bar: 'bg-amber-500',   chip: 'bg-amber-50 text-amber-700' },
  low:      { label: 'Low',      bar: 'bg-sky-500',     chip: 'bg-sky-50 text-sky-700' },
};

function sevFor(severity: string): { label: string; bar: string; chip: string } {
  switch (severity) {
    case 'critical': return SEVERITY_META.critical;
    case 'high':     return SEVERITY_META.high;
    case 'medium':   return SEVERITY_META.medium;
    case 'low':      return SEVERITY_META.low;
    default:         return SEVERITY_META.critical;
  }
}

const SERVICE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  payments: Server,
  redis: Server,
  database: Server,
  'api-gateway': Server,
  infrastructure: Server,
};

const SERVICE_LABEL: Record<string, string> = {
  payments: 'Payment Service',
  redis: 'User Service',
  database: 'Database Service',
  'api-gateway': 'API Gateway',
  infrastructure: 'Infrastructure',
};

const SERVICE_ICON_BG: Record<string, string> = {
  payments: 'bg-blue-50 text-blue-600',
  redis: 'bg-orange-50 text-orange-600',
  database: 'bg-blue-50 text-blue-600',
  'api-gateway': 'bg-emerald-50 text-emerald-600',
  infrastructure: 'bg-amber-50 text-amber-600',
};

const AI_STATUSES = [
  { label: 'Investigation Complete', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Analyzing',             color: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50' },
  { label: 'Collecting Data',        color: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50' },
  { label: 'Awaiting Context',       color: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-50' },
];

const DURATIONS = ['42m', '28m', '15m', '8m', '5m', '3m'];

function pickStatus(id: string): typeof AI_STATUSES[number] {
  const idx = id.charCodeAt(id.length - 1) % AI_STATUSES.length;
  return AI_STATUSES[idx]!;
}

function pickDuration(id: string): string {
  const idx = id.charCodeAt(id.length - 1) % DURATIONS.length;
  return DURATIONS[idx]!;
}

export function ActiveIncidentsTable({
  limit = 4,
  className,
}: ActiveIncidentsTableProps): JSX.Element {
  const rows = overviewIncidents.slice(0, limit);
  return (
    <div className={cn('im-card overflow-hidden', className)}>
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Active Incidents</h3>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300"
        >
          View All Incidents
        </button>
      </header>

      <div className="grid grid-cols-[1.4fr_0.9fr_0.7fr_1.1fr_0.6fr_0.8fr_auto] gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        <span>Incident</span>
        <span>Service</span>
        <span>Severity</span>
        <span>AI Status</span>
        <span>Duration</span>
        <span>Human Approval</span>
        <span>Actions</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {rows.map((row) => {
          const sev = sevFor(row.severity);
          const status = pickStatus(row.id);
          const duration = pickDuration(row.id);
          const ServiceIcon = SERVICE_ICON[row.service] ?? Server;
          const serviceLabel = SERVICE_LABEL[row.service] ?? row.service;
          const serviceTone = SERVICE_ICON_BG[row.service] ?? 'bg-slate-50 text-slate-600';
          const needsApproval = row.severity === 'critical' || row.severity === 'high';
          return (
            <li
              key={row.id}
              className="group relative grid grid-cols-[1.4fr_0.9fr_0.7fr_1.1fr_0.6fr_0.8fr_auto] items-center gap-4 px-5 py-3.5"
            >
              <span
                aria-hidden
                className={cn('absolute inset-y-2 left-0 w-1 rounded-r-full', sev.bar)}
              />
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500"
                  aria-hidden
                >
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900">
                    {row.title}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    INC-2025-001{row.id.charCodeAt(row.id.length - 1) % 10}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-md',
                    serviceTone,
                  )}
                  aria-hidden
                >
                  <ServiceIcon className="h-3 w-3" />
                </span>
                {serviceLabel}
              </div>

              <span
                className={cn(
                  'inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                  sev.chip,
                )}
              >
                {sev.label}
              </span>

              <span
                className={cn(
                  'inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                  status.bg,
                  status.text,
                )}
              >
                <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', status.color)} />
                {status.label}
              </span>

              <span className="font-mono text-xs tabular-nums text-slate-700">
                {duration}
              </span>

              {needsApproval ? (
                <span className="inline-flex w-fit items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Pending
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={cn(
                    'inline-flex h-7 items-center rounded-md px-3 text-[11px] font-semibold transition-colors',
                    needsApproval
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  )}
                >
                  {needsApproval ? 'Review' : 'View'}
                </button>
                <button
                  type="button"
                  aria-label="More actions"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
