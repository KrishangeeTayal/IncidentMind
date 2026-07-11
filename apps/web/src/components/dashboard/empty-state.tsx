// Empty state shown on the dashboard when there's no incident data.
// Includes the "Start Demo" entry point that drives the frontend
// simulation.

import { Plus, Play, ShieldCheck, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onStartDemo: () => void;
  onCreateIncident?: () => void;
  isDemoRunning?: boolean;
}

export function EmptyState({
  onStartDemo,
  onCreateIncident,
  isDemoRunning,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm md:p-12">
      {/* Soft gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(99, 102, 241, 0.10) 0%, rgba(37, 99, 235, 0.04) 40%, rgba(255, 255, 255, 0) 80%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl ai-gradient shadow-lg">
          <Sparkles className="h-6 w-6 text-white" aria-hidden />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          All systems operational
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          AI agents are continuously monitoring your infrastructure for
          anomalies and operational risks.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
          <span className="pulse-success h-1.5 w-1.5 rounded-full bg-emerald-500" />
          7 agents online · Enkrypt safety gate active
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStartDemo}
            disabled={isDemoRunning}
            className="ai-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-px hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden />
            {isDemoRunning ? 'Demo running…' : 'Start Demo'}
          </button>
          {onCreateIncident ? (
            <button
              type="button"
              onClick={onCreateIncident}
              disabled={isDemoRunning}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create Incident
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" aria-hidden /> Human approval required
          </span>
          <span>·</span>
          <span>No auto-deploys</span>
          <span>·</span>
          <span>Audit trail on every action</span>
        </div>
      </div>
    </div>
  );
}
