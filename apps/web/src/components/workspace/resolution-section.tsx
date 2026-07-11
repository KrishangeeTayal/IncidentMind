'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Loader2,
  PartyPopper,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { SectionHeading } from './section-heading';
import { cn } from '@/lib/utils';
import type { ApprovalDecision } from '@/lib/overview-data';

export type ResolutionPhase =
  | 'waiting'
  | 'mitigating'
  | 'resolved'
  | 'postmortem'
  | 'knowledge';

const PHASE_ORDER: ResolutionPhase[] = [
  'waiting',
  'mitigating',
  'resolved',
  'postmortem',
  'knowledge',
];

const PHASE_META: Record<
  ResolutionPhase,
  { label: string; description: string; icon: typeof Clock }
> = {
  waiting: {
    label: 'Waiting for human approval',
    description: 'The AI recommendation is ready. No actions will run until you decide.',
    icon: Clock,
  },
  mitigating: {
    label: 'Mitigation Started',
    description: 'Executing the approved remediation plan.',
    icon: Loader2,
  },
  resolved: {
    label: 'Resolved',
    description: 'Customer impact ended. The primary service is back to nominal.',
    icon: CheckCircle2,
  },
  postmortem: {
    label: 'Postmortem Generated',
    description: 'A draft postmortem has been attached to this incident.',
    icon: FileText,
  },
  knowledge: {
    label: 'Knowledge Base Updated',
    description: '2 vectors indexed in Qdrant. Future similar incidents will retrieve this run.',
    icon: Database,
  },
};

interface ResolutionSectionProps {
  approval: ApprovalDecision;
}

export function ResolutionSection({ approval }: ResolutionSectionProps): JSX.Element {
  const [phase, setPhase] = useState<ResolutionPhase>('waiting');

  // Reset to "waiting" whenever the user resets the approval.
  useEffect(() => {
    if (approval === 'pending') {
      setPhase('waiting');
    }
  }, [approval]);

  // When approved, walk through the phases with a delay.
  useEffect(() => {
    if (approval !== 'approved') return;
    const sequence: ResolutionPhase[] = ['mitigating', 'resolved', 'postmortem', 'knowledge'];
    let i = 0;
    setPhase('mitigating');
    const tick = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(tick);
        return;
      }
      setPhase(sequence[i]!);
      i += 1;
    }, 1400);
    return () => clearInterval(tick);
  }, [approval]);

  const isRejected = approval === 'rejected';
  const currentIdx = PHASE_ORDER.indexOf(phase);

  return (
    <section
      id="section-resolution"
      aria-labelledby="section-resolution-heading"
      className="im-card p-6"
    >
      <SectionHeading
        index={7}
        title="Resolution"
        subtitle={
          isRejected
            ? 'Recommendation rejected · AI is re-planning'
            : 'Live execution status of the approved plan'
        }
        icon={Sparkles}
        id="section-resolution"
      />

      <div className="mt-5">
        {isRejected ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-800">
              <XCircle className="h-4 w-4" aria-hidden />
              Recommendation rejected
            </p>
            <p className="mt-1.5 text-xs text-slate-600">
              The AI will re-plan with the additional context you provided. No
              actions were taken against production.
            </p>
          </div>
        ) : (
          <ol className="space-y-0">
            {PHASE_ORDER.map((p, idx) => {
              const meta = PHASE_META[p];
              const Icon = meta.icon;
              const isDone = idx < currentIdx;
              const isActive = idx === currentIdx;
              const isPending = idx > currentIdx;
              const isLast = idx === PHASE_ORDER.length - 1;
              return (
                <li
                  key={p}
                  className={cn(
                    'relative flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300',
                    idx > 0 && 'mt-2',
                    isActive && 'border-blue-200 bg-blue-50/40 shadow-sm',
                    isDone && 'border-emerald-100 bg-emerald-50/20',
                    isPending && 'border-slate-200 bg-white',
                  )}
                >
                  <div className="flex flex-col items-center pt-0.5">
                    {isDone ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    ) : isActive ? (
                      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-30" />
                        <Icon
                          className={cn(
                            'relative h-3.5 w-3.5',
                            p === 'mitigating' && 'animate-spin',
                          )}
                          aria-hidden
                        />
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                    {!isLast ? (
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1 h-3 w-px',
                          isDone ? 'bg-slate-200' : isActive ? 'bg-blue-200' : 'bg-slate-200',
                        )}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 pb-1">
                    <p
                      className={cn(
                        'text-sm font-semibold tracking-tight',
                        isActive ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-400',
                      )}
                    >
                      {meta.label}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-xs',
                        isActive ? 'text-slate-700' : 'text-slate-500',
                      )}
                    >
                      {meta.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {approval === 'approved' && phase === 'knowledge' ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
            <PartyPopper className="h-4 w-4" aria-hidden />
            <span className="font-medium">Run complete.</span>
            <span className="text-emerald-700/80">
              Every step below was logged. The incident is closed and the
              knowledge base is ready for the next occurrence.
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
