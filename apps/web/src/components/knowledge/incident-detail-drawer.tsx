'use client';

// Right-side detail drawer for a historical incident. Always mounted
// so its open/close animates; the inner panel only renders when an
// incident is passed in.

import { useEffect } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type KnowledgeIncident, type ServiceFilter } from '@/lib/knowledge-data';

interface IncidentDrawerHostProps {
  incident: KnowledgeIncident | null;
  onClose: () => void;
}

const SERVICE_LABEL: Record<ServiceFilter['id'], string> = {
  payments: 'Payments',
  redis: 'Redis',
  database: 'Database',
  'api-gateway': 'API Gateway',
  infrastructure: 'Infrastructure',
};

export function IncidentDrawerHost({
  incident,
  onClose,
}: IncidentDrawerHostProps): JSX.Element {
  const open = incident != null;

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      {/* Backdrop */}
      <div
        onClick={open ? onClose : undefined}
        className={cn(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-drawer-title"
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {incident ? (
          <DrawerBody incident={incident} onClose={onClose} />
        ) : null}
      </aside>
    </div>
  );
}

function DrawerBody({
  incident,
  onClose,
}: {
  incident: KnowledgeIncident;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                severityTone(incident.severity),
              )}
            >
              {incident.severity}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {SERVICE_LABEL[incident.service]}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700',
              )}
            >
              <Sparkles className="h-2.5 w-2.5" aria-hidden />
              {incident.similarityScore}% match
            </span>
          </div>
          <h2
            id="incident-drawer-title"
            className="text-base font-semibold text-slate-900"
          >
            {incident.name}
          </h2>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>
              <span className="font-medium text-slate-700">{incident.detectedAt}</span>
            </span>
            <span aria-hidden>→</span>
            <span>
              Resolved{' '}
              <span className="font-medium text-slate-700">
                {incident.resolvedAt}
              </span>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" aria-hidden />
              {incident.resolutionTime}
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

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <Section icon={Sparkles} title="Incident Summary">
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.summary}
          </p>
        </Section>

        <Section icon={Target} title="Root Cause">
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.rootCause}
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Evidence">
          <ul className="space-y-1.5">
            {incident.evidence.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                />
                <span className="font-mono text-xs leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={Brain}
          title="AI Recommendation"
          accent="violet"
          trailing={
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-700">
              {incident.confidence}% confidence
            </span>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.aiRecommendation}
          </p>
        </Section>

        <Section icon={CheckCircle2} title="Final Resolution" accent="emerald">
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.finalResolution}
          </p>
        </Section>

        <Section icon={Lightbulb} title="Lessons Learned" accent="amber">
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.lessonsLearned}
          </p>
        </Section>

        <Section icon={Clock} title="Timeline">
          <ol className="space-y-3">
            {incident.timeline.map((entry, i) => (
              <li key={i} className="relative pl-6">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300 ring-2"
                />
                {i < incident.timeline.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[5px] top-4 h-full w-px bg-slate-200"
                  />
                ) : null}
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] font-semibold text-slate-500">
                    {entry.time}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {entry.title}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section icon={BookOpen} title="Generated Runbook" accent="blue">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/60 p-3 font-mono text-[11px] leading-relaxed text-slate-700">
            {incident.generatedRunbook}
          </pre>
        </Section>

        <Section
          icon={ShieldCheck}
          title="Preventive Action"
          accent="violet"
        >
          <p className="text-sm leading-relaxed text-slate-600">
            {incident.preventiveAction}
          </p>
        </Section>
      </div>
    </>
  );
}

function severityTone(s: KnowledgeIncident['severity']): string {
  switch (s) {
    case 'critical': return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'high':     return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'medium':   return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'low':      return 'border-sky-200 bg-sky-50 text-sky-700';
    default:         return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  accent?: 'violet' | 'emerald' | 'amber' | 'blue';
  trailing?: React.ReactNode;
}

function Section({
  icon: Icon,
  title,
  children,
  accent,
  trailing,
}: SectionProps): JSX.Element {
  const iconTone = (() => {
    switch (accent) {
      case 'violet':  return 'bg-violet-50 text-violet-600';
      case 'emerald': return 'bg-emerald-50 text-emerald-600';
      case 'amber':   return 'bg-amber-50 text-amber-600';
      case 'blue':    return 'bg-blue-50 text-blue-600';
      default:        return 'bg-slate-50 text-slate-600';
    }
  })();

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-md',
              iconTone,
            )}
            aria-hidden
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </h3>
        {trailing}
      </div>
      {children}
    </section>
  );
}
