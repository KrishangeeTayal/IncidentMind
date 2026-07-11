'use client';

import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { overviewKpis } from '@/lib/overview-data';
import { OverviewKpiCard, type OverviewKpiCardProps } from './overview-kpi-card';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'Active Incidents': Activity,
  'Pending Approvals': ShieldCheck,
  'Average MTTR': Clock,
  'Resolved Today': CheckCircle2,
  'AI Confidence': Sparkles,
};

const TONE_MAP: Record<string, OverviewKpiCardProps['tone']> = {
  'Active Incidents': 'critical',
  'Pending Approvals': 'warning',
  'Average MTTR': 'success',
  'Resolved Today': 'info',
  'AI Confidence': 'ai',
};

// Inline chips beside the metric, mirroring the reference design.
const CHIP_MAP: Record<string, OverviewKpiCardProps['chip']> = {
  'Active Incidents': { label: '2 Critical', tone: 'critical' },
  'Pending Approvals': { label: 'High Priority', tone: 'warning' },
  'Resolved Today': { label: '20%', tone: 'success' },
};

export function OverviewKpis(): JSX.Element {
  return (
    <section
      aria-label="Key metrics"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {overviewKpis.map((kpi) => {
        const chip = CHIP_MAP[kpi.label];
        return (
          <OverviewKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            displayValue={kpi.displayValue}
            secondaryLabel={kpi.secondaryLabel}
            icon={ICON_MAP[kpi.label] ?? Activity}
            tone={TONE_MAP[kpi.label] ?? 'muted'}
            chip={chip}
            trend={kpi.trend}
            trendTone={kpi.trendTone}
          />
        );
      })}
    </section>
  );
}
