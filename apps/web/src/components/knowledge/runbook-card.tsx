'use client';

import { ChevronDown, Clock, ListChecks, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Runbook, type ServiceFilter } from '@/lib/knowledge-data';

interface RunbookCardProps {
  runbook: Runbook;
  isOpen: boolean;
  onToggle: () => void;
}

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

function successTone(rate: number): string {
  if (rate >= 90) return 'text-emerald-700';
  if (rate >= 80) return 'text-blue-700';
  return 'text-amber-700';
}

export function RunbookCard({ runbook, isOpen, onToggle }: RunbookCardProps): JSX.Element {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-white',
        isOpen
          ? 'border-violet-200 shadow-sm'
          : 'border-slate-200 shadow-sm',
        'transition-all',
      )}
    >
      <header className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900">
              {runbook.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                {runbook.services.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                  >
                    <span
                      aria-hidden
                      className={cn('h-1.5 w-1.5 rounded-full', SERVICE_DOT[s])}
                    />
                    {SERVICE_LABEL[s]}
                  </span>
                ))}
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Clock className="h-3 w-3" aria-hidden />
                {runbook.estimatedRecovery}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-mono font-semibold tabular-nums',
                  successTone(runbook.successRate),
                )}
              >
                <Zap className="h-3 w-3" aria-hidden />
                {runbook.successRate}% success
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors',
              isOpen
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            )}
          >
            {isOpen ? 'Close' : 'Open'}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                isOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">{runbook.lastUsed}</p>
      </header>

      {isOpen ? (
        <div className="space-y-3 border-t border-violet-100 bg-violet-50/30 p-4">
          <div>
            <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
              <ListChecks className="h-3 w-3" aria-hidden />
              Triggers
            </h4>
            <ul className="mt-1.5 space-y-1">
              {runbook.triggers.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
              <span className="font-mono">{'</>'}</span>
              Steps
            </h4>
            <ol className="mt-1.5 space-y-1.5">
              {runbook.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-semibold',
                      'bg-violet-100 text-violet-700',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </article>
  );
}
