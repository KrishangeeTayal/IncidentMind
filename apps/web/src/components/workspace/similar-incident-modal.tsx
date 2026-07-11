'use client';

import { useEffect, type MouseEvent } from 'react';
import { BookOpen, CheckCircle2, Clock, Target, X } from 'lucide-react';
import type { SimilarIncident } from '@/lib/demo-incidents';
import { cn } from '@/lib/utils';

interface SimilarIncidentModalProps {
  incident: SimilarIncident | null;
  onClose: () => void;
}

export function SimilarIncidentModal({
  incident,
  onClose,
}: SimilarIncidentModalProps): JSX.Element | null {
  // Lock body scroll while open.
  useEffect(() => {
    if (!incident) return;
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
  }, [incident, onClose]);

  if (!incident) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="similar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden im-card shadow-2xl"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              Similar incident
            </span>
            <h3
              id="similar-modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              {incident.title}
            </h3>
            <p className="text-xs text-slate-500">
              {incident.date} · similarity{' '}
              <span className="font-mono tabular-nums text-slate-700">
                {(incident.similarity * 100).toFixed(0)}%
              </span>{' '}
              · resolved in{' '}
              <span className="font-mono tabular-nums text-slate-700">
                {incident.resolutionTimeMinutes} min
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <Block
            icon={BookOpen}
            label="Summary"
            body={incident.summary}
          />
          <Block
            icon={Target}
            label="Root cause"
            body={incident.rootCause}
            tone="warning"
          />
          <Block
            icon={CheckCircle2}
            label="Resolution"
            body={incident.resolution}
            tone="success"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Lessons Learned
            </p>
            <ul className="mt-2 space-y-1.5">
              {incident.lessonsLearned.map((l, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-700"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

interface BlockProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  body: string;
  tone?: 'default' | 'success' | 'warning';
}

function Block({ icon: Icon, label, body, tone = 'default' }: BlockProps): JSX.Element {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600'
      : tone === 'warning'
      ? 'text-amber-600'
      : 'text-slate-500';
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className={cn('h-3 w-3', toneClass)} aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-800">{body}</p>
    </div>
  );
}

void Clock;
