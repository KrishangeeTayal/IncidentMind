// Premium hero banner for the dashboard. Subtle blue→indigo gradient,
// large rounded container, env + status + AI status + last monitoring time.

import { Activity, Brain, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { APP_NAME } from '@incidentmind/shared';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  environment?: string;
  aiStatus?: 'online' | 'degraded' | 'offline';
  lastMonitoredAt?: Date;
  className?: string;
}

const AI_STATUS_META: Record<
  NonNullable<HeroBannerProps['aiStatus']>,
  { label: string; color: string; dot: string }
> = {
  online: { label: 'All agents online', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  degraded: { label: 'Degraded', color: 'text-amber-700', dot: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'text-rose-700', dot: 'bg-rose-500' },
};

function formatRelative(d: Date, now: Date = new Date()): string {
  const diff = now.getTime() - d.getTime();
  if (diff < 0) return 'just now';
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleString();
}

export function HeroBanner({
  environment = 'production',
  aiStatus = 'online',
  lastMonitoredAt,
  className,
}: HeroBannerProps): JSX.Element {
  const ai = AI_STATUS_META[aiStatus];
  const last = lastMonitoredAt ?? new Date();

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-sm',
        className,
      )}
    >
      {/* Soft blue → indigo wash */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(37, 99, 235, 0.10) 0%, rgba(99, 102, 241, 0.06) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-blue-700 backdrop-blur">
              <Sparkles className="h-3 w-3" aria-hidden />
              AI Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-[34px]">
            {APP_NAME}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            AI-powered Incident Operations Center. Reduce MTTR with safe,
            human-in-the-loop assistance — every recommendation passes
            Enkrypt evaluation and human approval before action.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          <StatusTile
            icon={Activity}
            label="Environment"
            value={
              <span className="capitalize">{environment}</span>
            }
            tone="blue"
          />
          <StatusTile
            icon={CheckCircle2}
            label="System status"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="pulse-success h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            }
            tone="emerald"
          />
          <StatusTile
            icon={Brain}
            label="AI status"
            value={
              <span className={cn('inline-flex items-center gap-1.5', ai.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', ai.dot)} />
                {ai.label}
              </span>
            }
            tone="purple"
          />
          <StatusTile
            icon={Clock}
            label="Last monitoring"
            value={
              <span className="font-mono text-xs tabular-nums">
                {formatRelative(last)}
              </span>
            }
            tone="slate"
            className="col-span-2 sm:col-span-3 md:col-span-1"
          />
        </dl>
      </div>
    </section>
  );
}

interface StatusTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone: 'blue' | 'emerald' | 'purple' | 'slate';
  className?: string;
}

const TILE_TONE: Record<StatusTileProps['tone'], { ring: string; icon: string; bg: string }> = {
  blue: { ring: 'ring-blue-100', icon: 'text-blue-600', bg: 'bg-blue-50' },
  emerald: { ring: 'ring-emerald-100', icon: 'text-emerald-600', bg: 'bg-emerald-50' },
  purple: { ring: 'ring-violet-100', icon: 'text-violet-600', bg: 'bg-violet-50' },
  slate: { ring: 'ring-slate-100', icon: 'text-slate-600', bg: 'bg-slate-50' },
};

function StatusTile({ icon: Icon, label, value, tone, className }: StatusTileProps): JSX.Element {
  const meta = TILE_TONE[tone];
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white/80 p-3 backdrop-blur',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg ring-1',
          meta.bg,
          meta.ring,
        )}
      >
        <Icon className={cn('h-4 w-4', meta.icon)} aria-hidden />
      </div>
      <div className="min-w-0">
        <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm font-medium leading-tight">{value}</dd>
      </div>
    </div>
  );
}
