'use client';

import { useEffect } from 'react';
import { BookOpen, CheckCircle2, Target, X } from 'lucide-react';
import type { IncidentPattern as Pattern } from '@/lib/analytics-data';
import { cn } from '@/lib/utils';

interface IncidentPatternModalProps {
  pattern: Pattern | null;
  rank: number | null;
  onClose: () => void;
}

export function IncidentPatternModal({
  pattern,
  rank,
  onClose,
}: IncidentPatternModalProps): JSX.Element | null {
  useEffect(() => {
    if (!pattern) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handler);
    };
  }, [pattern, onClose]);

  if (!pattern) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pattern-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl',
          'max-h-[88vh] flex flex-col',
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {rank != null ? (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-violet-50 text-[10px] font-bold text-violet-600">
                  #{rank}
                </span>
              ) : null}
              Top Incident Pattern
            </p>
            <h2
              id="pattern-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              {pattern.pattern}
            </h2>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
              <span>
                <span className="font-mono font-semibold text-slate-700">
                  {pattern.occurrences}
                </span>{' '}
                occurrences
              </span>
              <span aria-hidden>·</span>
              <span>
                Avg recovery{' '}
                <span className="font-mono font-semibold text-slate-700">
                  {pattern.avgRecovery}
                </span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto p-5">
          <section className="rounded-xl border border-slate-200/80 bg-white p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <Target className="h-3.5 w-3.5 text-rose-500" aria-hidden />
              Typical Root Cause
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {pattern.typicalRootCause}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <BookOpen className="h-3.5 w-3.5 text-violet-500" aria-hidden />
              Recommended Playbook
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {pattern.recommendedPlaybook}
            </p>
          </section>

          <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Historical Success Rate
            </h3>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-mono text-3xl font-bold tabular-nums text-emerald-700">
                {pattern.historicalSuccessRate}%
              </p>
              <p className="text-xs text-emerald-700/80">
                of historical incidents resolved using the recommended playbook.
              </p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${pattern.historicalSuccessRate}%` }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
