'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import type { Incident, IncidentSeverity } from '@incidentmind/shared';

interface AnalyticsSummary {
  totals: {
    incidents: number;
    open: number;
    investigating: number;
    mitigated: number;
    resolved: number;
  };
  mttrSeconds: number | null;
}

import { KpiCard } from './kpi-card';
import { SeverityDistribution } from './severity-distribution';
import { HeroBanner } from './hero-banner';
import { LiveIncidentFeed } from './live-incident-feed';
import { EmptyState } from './empty-state';
import { AiCopilotPanel } from './ai-copilot-panel';
import { AIKnowledgeBase } from './ai-knowledge-base';
import { useDemoMode } from '@/hooks/use-demo-mode';
import { formatDuration } from '@/lib/format';
import { PHASE_LABELS, type DemoPhase } from '@/lib/demo-scenarios';
import { cn } from '@/lib/utils';

interface DashboardLiveProps {
  dashboard: {
    activeIncidents: number;
    pendingApprovals: number;
    mttrSeconds: number | null;
  } | null;
  analytics: AnalyticsSummary | null;
  incidents: Incident[];
  severityCounts: Record<IncidentSeverity, number>;
}

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0,
};

const SEVERITY_TONE: Record<IncidentSeverity, 'red' | 'amber' | 'emerald' | 'slate'> = {
  critical: 'red',
  high: 'amber',
  medium: 'slate',
  low: 'emerald',
};

export function DashboardLive({
  dashboard,
  analytics,
  incidents,
  severityCounts,
}: DashboardLiveProps): JSX.Element {
  // Synthetic state driven by the demo mode
  const [demoIncidents, setDemoIncidents] = useState<Incident[]>([]);
  const [activeScenario, setActiveScenario] = useState<{
    phase: DemoPhase;
    scenario: import('@/lib/demo-scenarios').DemoIncidentSeed | null;
  }>({ phase: 'idle', scenario: null });

  const onIncidentCreated = useCallback((incident: Incident) => {
    setDemoIncidents((arr) => [incident, ...arr]);
  }, []);
  const onIncidentUpdated = useCallback((incident: Incident) => {
    setDemoIncidents((arr) =>
      arr.map((i) => (i.id === incident.id ? incident : i)),
    );
  }, []);
  const onIncidentCleared = useCallback((id: string) => {
    setDemoIncidents((arr) => arr.filter((i) => i.id !== id));
  }, []);
  const onPhaseAdvanced = useCallback(
    (
      phase: DemoPhase,
      scenario: import('@/lib/demo-scenarios').DemoIncidentSeed | null,
    ) => {
      setActiveScenario({ phase, scenario });
    },
    [],
  );

  const { state: demo, controls } = useDemoMode(
    onIncidentCreated,
    onIncidentUpdated,
    onIncidentCleared,
    onPhaseAdvanced,
  );

  // Merge real + demo incidents
  const merged = useMemo<Incident[]>(() => {
    const ids = new Set<string>();
    const out: Incident[] = [];
    for (const i of [...demoIncidents, ...incidents]) {
      if (ids.has(i.id)) continue;
      ids.add(i.id);
      out.push(i);
    }
    // Sort: critical first, then by recency
    return out.sort((a, b) => {
      const r = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      if (r !== 0) return r;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [demoIncidents, incidents]);

  const mergedSeverityCounts: Record<IncidentSeverity, number> = useMemo(() => {
    const out: Record<IncidentSeverity, number> = { ...severityCounts };
    for (const i of demoIncidents) {
      out[i.severity] = (out[i.severity] ?? 0) + 1;
    }
    return out;
  }, [demoIncidents, severityCounts]);

  const isEmpty = merged.length === 0 && !demo.running;

  const activeCount =
    (dashboard?.activeIncidents ?? 0) +
    demoIncidents.filter((i) => i.status !== 'resolved').length;
  const pendingApprovals = dashboard?.pendingApprovals ?? 0;
  const resolvedTotal =
    (analytics?.totals.resolved ?? 0) +
    demoIncidents.filter((i) => i.status === 'resolved').length;
  const mttrSeconds =
    analytics?.mttrSeconds ??
    (analytics?.totals.resolved && analytics.totals.resolved > 0
      ? null
      : null);

  // Knowledge base stats: derived from demo state when running, otherwise defaults.
  const knowledgeStats = demo.running
    ? {
        similarIncidents: 5,
        runbooks: 3,
        sops: 2,
        semanticMatches: 12,
        postmortems: demo.phase === 'postmortem' || demo.phase === 'knowledge' || demo.phase === 'complete' ? 1 : 0,
      }
    : {
        similarIncidents: 0,
        runbooks: 0,
        sops: 0,
        semanticMatches: 0,
        postmortems: 0,
      };

  const aiConfidence =
    demo.running && demo.scenario ? demo.scenario.confidence : undefined;

  const approvalStatus: 'pending' | 'approved' | 'rejected' | 'awaiting' =
    demo.phase === 'awaiting_approval'
      ? 'awaiting'
      : demo.phase === 'mitigation' || demo.phase === 'resolved' || demo.phase === 'postmortem' || demo.phase === 'knowledge' || demo.phase === 'complete'
      ? 'approved'
      : 'awaiting';

  return (
    <div className="space-y-6">
      <HeroBanner
        environment="production"
        aiStatus="online"
        lastMonitoredAt={new Date()}
      />

      {/* KPI grid */}
      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Active incidents"
          value={activeCount}
          icon={Activity}
          tone="red"
          trend={demo.running ? 12.4 : -3.2}
          goodIsUp={false}
          hint="Open or under investigation"
        />
        <KpiCard
          label="Pending approvals"
          value={pendingApprovals + (demo.phase === 'awaiting_approval' ? 1 : 0)}
          icon={ShieldCheck}
          tone="amber"
          trend={0.8}
          goodIsUp={false}
          hint="Awaiting human decision"
        />
        <KpiCard
          label="MTTR"
          value={0}
          displayValue={formatDuration(mttrSeconds)}
          icon={Clock}
          tone="blue"
          trend={-8.6}
          goodIsUp={false}
          hint="Mean time to resolution"
        />
        <KpiCard
          label="Resolved"
          value={resolvedTotal}
          icon={CheckCircle2}
          tone="emerald"
          trend={4.1}
          hint={`${(analytics?.totals.mitigated ?? 0) +
            demoIncidents.filter((i) => i.status === 'mitigated').length} mitigated`}
        />
      </section>

      {/* AI Copilot + Severity distribution */}
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AiCopilotPanel
            phase={activeScenario.phase}
            progress={demo.progress}
            active={demo.running}
            {...(demo.scenario
              ? { scenarioTitle: demo.scenario.title }
              : {})}
            {...(demo.scenario
              ? { rootCause: demo.scenario.rootCause }
              : { rootCause: 'No active investigation' })}
            {...(demo.scenario
              ? { confidence: demo.scenario.confidence }
              : {})}
            {...(demo.scenario
              ? { recommendation: demo.scenario.recommendation }
              : {})}
            {...(demo.scenario
              ? { riskLevel: demo.scenario.riskLevel }
              : {})}
            approvalStatus={approvalStatus}
            recentActions={demo.recentActions}
          />
        </div>
        <div className="xl:col-span-1">
          <SeverityDistribution
            counts={mergedSeverityCounts}
            total={
              (analytics?.totals.incidents ?? 0) + demoIncidents.length
            }
          />
        </div>
      </section>

      {/* Live feed OR empty state */}
      {isEmpty ? (
        <EmptyState
          onStartDemo={controls.start}
          onCreateIncident={controls.start}
          isDemoRunning={demo.running}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <LiveIncidentFeed
              incidents={merged}
              {...(aiConfidence !== undefined
                ? { confidenceById: { [demo.scenario!.id]: aiConfidence } }
                : {})}
            />
          </div>
          <div className="xl:col-span-1 space-y-4">
            <AIKnowledgeBase stats={knowledgeStats} />
            {demo.running ? (
              <button
                type="button"
                onClick={controls.reset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Reset demo
              </button>
            ) : null}
          </div>
        </section>
      )}

      {/* AI Knowledge Base (also visible while running) */}
      {!isEmpty ? (
        <AIKnowledgeBase stats={knowledgeStats} />
      ) : null}

      {/* Helper row when demo is running: keep it visible for live progress */}
      {demo.running ? (
        <div
          className={cn(
            'sticky bottom-4 z-10 mx-auto flex max-w-md items-center gap-3 rounded-full border bg-white/90 px-4 py-2 shadow-md backdrop-blur',
          )}
        >
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-violet-500" />
          <p className="flex-1 text-xs text-muted-foreground">
            Demo running · {labelFor(demo.phase)}
          </p>
          <button
            type="button"
            onClick={controls.stop}
            className="text-[11px] font-medium text-rose-600 hover:underline"
          >
            Stop
          </button>
        </div>
      ) : null}
    </div>
  );
}

function labelFor(phase: DemoPhase): string {
  return PHASE_LABELS[phase] ?? phase;
}
