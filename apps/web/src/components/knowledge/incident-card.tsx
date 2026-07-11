'use client';

import { ArrowUpRight, CheckCircle2, Clock, Eye, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type KnowledgeIncident,
  type ServiceFilter,
} from '@/lib/knowledge-data';

interface IncidentCardProps {
  incident: KnowledgeIncident;
  isActive: boolean;
  onOpen: () => void;
}

const SEVERITY_TONE: Record<KnowledgeIncident['severity'], {
  text: string;
  bg: string;
  ring: string;
}> = {
  critical: { text: 'text-rose-700',    bg: 'bg-rose-50',    ring: 'ring-rose-200' },
  high:     { text: 'text-orange-700',  bg: 'bg-orange-50',  ring: 'ring-orange-200' },
  medium:   { text: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-200' },
  low:      { text: 'text-sky-700',     bg: 'bg-sky-50',     ring: 'ring-sky-200' },
};

const SERVICE_LABEL: Record<ServiceFilter['id'], string> = {
  payments: 'Payments',
  redis: 'Redis',
  database: 'Database',
  'api-gateway': 'API Gateway',
  infrastructure: 'Infrastructure',
};

const SERVICE_DOT: Record<ServiceFilter['id'], string> = {
  payments: 'bg-blue-500',
  redis: 'bg-rose-500',
  database: 'bg-violet-500',
  'api-gateway': 'bg-emerald-500',
  infrastructure: 'bg-amber-500',
};

const STATUS_TONE: Record<KnowledgeIncident['status'], {
  text: string;
  bg: string;
  dot: string;
}> = {
  resolved:   { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  monitoring: { text: 'text-blue-700',    bg: 'bg-blue-50',    dot: 'bg-blue-500' },
  open:       { text: 'text-amber-700',   bg: 'bg-amber-50',   dot: 'bg-amber-500' },
};

function similarityTone(score: number): string {
  if (score >= 90) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (score >= 80) return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function IncidentCard({
  incident,
  isActive,
  onOpen,
}: IncidentCardProps): JSX.Element {
  const sev = SEVERITY_TONE[incident.severity]!;
  const st = STATUS_TONE[incident.status]!;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-3 rounded-xl border bg-white p-4',
        'transition-all duration-200',
        isActive
          ? 'border-blue-300 ring-2'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              sev.bg,
              sev.text,
              sev.ring,
              'ring-1',
            )}
          >
            {incident.severity}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              st.bg,
              st.text,
            )}
          >
            <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
            {incident.status}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
            similarityTone(incident.similarityScore),
          )}
          title="AI similarity score"
        >
          <Layers className="h-2.5 w-2.5" aria-hidden />
          {incident.similarityScore}%
        </span>
      </header>

      <div>
        <h3 className="text-sm font-semibold leading-snug text-slate-900">
          {incident.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {incident.summary}
        </p>
      </div>

      <dl className="mt-1 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <div>
          <dt className="flex items-center gap-1 text-slate-400">
            <span
              aria-hidden
              className={cn('h-1.5 w-1.5 rounded-full', SERVICE_DOT[incident.service])}
            />
            Service
          </dt>
          <dd className="mt-0.5 font-medium text-slate-700">
            {SERVICE_LABEL[incident.service]}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-slate-400">
            <Clock className="h-2.5 w-2.5" aria-hidden />
            Resolution time
          </dt>
          <dd className="mt-0.5 font-mono font-medium tabular-nums text-slate-700">
            {incident.resolutionTime}
          </dd>
        </div>
      </dl>

      <footer className="mt-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
          <CheckCircle2 className="h-3 w-3" aria-hidden />
          {incident.resolvedAt}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700',
          )}
        >
          <Eye className="h-3 w-3" aria-hidden />
          View Details
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </button>
      </footer>
    </article>
  );
}
