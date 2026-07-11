'use client';

import { useState } from 'react';
import { Activity, GitBranch, Layers, ScrollText, Server } from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type {
  DeploymentEntry,
  EvidenceBundle,
  EvidenceMetric,
  LogEntry,
  TraceEntry,
} from '@/lib/demo-incidents';

interface EvidenceSectionProps {
  evidence: EvidenceBundle;
}

type Tab = 'logs' | 'deployments' | 'traces';
const TABS: { id: Tab; label: string }[] = [
  { id: 'logs', label: 'Recent Logs' },
  { id: 'deployments', label: 'Deployment Timeline' },
  { id: 'traces', label: 'Trace Summary' },
];

const METRIC_TONE: Record<
  EvidenceMetric['tone'],
  { ring: string; icon: string; chip: string }
> = {
  critical: { ring: 'ring-rose-100', icon: 'text-rose-600', chip: 'bg-rose-50' },
  warning: { ring: 'ring-amber-100', icon: 'text-amber-600', chip: 'bg-amber-50' },
  info: { ring: 'ring-slate-200', icon: 'text-slate-600', chip: 'bg-slate-50' },
  success: { ring: 'ring-emerald-100', icon: 'text-emerald-600', chip: 'bg-emerald-50' },
};

const LOG_LEVEL: Record<LogEntry['level'], string> = {
  ERROR: 'text-rose-600',
  WARN: 'text-amber-600',
  INFO: 'text-slate-500',
  DEBUG: 'text-slate-400',
};

const DEPLOY_STATUS: Record<DeploymentEntry['status'], string> = {
  deployed: 'bg-emerald-50 text-emerald-700',
  'rolled-back': 'bg-rose-50 text-rose-700',
  'in-progress': 'bg-amber-50 text-amber-700',
};

const TRACE_STATUS: Record<TraceEntry['status'], string> = {
  timeout: 'text-rose-600',
  error: 'text-rose-600',
  ok: 'text-slate-500',
};

export function EvidenceSection({ evidence }: EvidenceSectionProps): JSX.Element {
  const [tab, setTab] = useState<Tab>('logs');

  return (
    <section
      id="section-evidence"
      aria-labelledby="section-evidence-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={2}
        title="Evidence"
        subtitle="Quantitative signals and supporting technical context"
        icon={Activity}
        id="section-evidence"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {evidence.metrics.map((m) => {
          const meta = METRIC_TONE[m.tone];
          return (
            <div
              key={m.label}
              className="im-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {m.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                {m.value}
              </p>
              {m.hint ? (
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    meta.chip,
                    meta.icon,
                  )}
                >
                  {m.hint}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200">
        <div role="tablist" className="flex border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors',
                tab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900',
              )}
            >
              {t.id === 'logs' ? (
                <ScrollText className="h-3.5 w-3.5" aria-hidden />
              ) : t.id === 'deployments' ? (
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Layers className="h-3.5 w-3.5" aria-hidden />
              )}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-3">
          {tab === 'logs' ? <LogsTable logs={evidence.logs} /> : null}
          {tab === 'deployments' ? (
            <DeploymentsList deployments={evidence.deployments} />
          ) : null}
          {tab === 'traces' ? <TracesTable traces={evidence.traces} /> : null}
        </div>
      </div>
    </section>
  );
}

function LogsTable({ logs }: { logs: LogEntry[] }): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Time</th>
            <th className="px-3 py-2 text-left font-medium">Level</th>
            <th className="px-3 py-2 text-left font-medium">Source</th>
            <th className="px-3 py-2 text-left font-medium">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l, i) => (
            <tr key={i} className="font-mono">
              <td className="px-3 py-2 text-slate-500 tabular-nums">{l.timestamp}</td>
              <td className={cn('px-3 py-2 font-semibold', LOG_LEVEL[l.level])}>
                {l.level}
              </td>
              <td className="px-3 py-2 text-slate-700">{l.source}</td>
              <td className="px-3 py-2 text-slate-700">{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeploymentsList({
  deployments,
}: {
  deployments: DeploymentEntry[];
}): JSX.Element {
  return (
    <ul className="space-y-2">
      {deployments.map((d, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
        >
          <span className="font-mono text-[11px] tabular-nums text-slate-500">
            {d.timestamp}
          </span>
          <Server className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-slate-900">{d.version}</p>
            <p className="text-[11px] text-slate-500">
              {d.service} · {d.author}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ',
              DEPLOY_STATUS[d.status],
            )}
          >
            {d.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TracesTable({ traces }: { traces: TraceEntry[] }): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Trace</th>
            <th className="px-3 py-2 text-left font-medium">Method</th>
            <th className="px-3 py-2 text-left font-medium">Endpoint</th>
            <th className="px-3 py-2 text-left font-medium">Pod</th>
            <th className="px-3 py-2 text-right font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {traces.map((t) => (
            <tr key={t.id} className="font-mono">
              <td className="px-3 py-2 text-slate-500">{t.id}</td>
              <td className="px-3 py-2 text-slate-700">{t.method}</td>
              <td className="px-3 py-2 text-slate-700">{t.endpoint}</td>
              <td className="px-3 py-2 text-slate-700">{t.pod}</td>
              <td
                className={cn(
                  'px-3 py-2 text-right tabular-nums font-semibold',
                  TRACE_STATUS[t.status],
                )}
              >
                {t.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
