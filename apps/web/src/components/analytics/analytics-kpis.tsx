'use client';

// Reuses the Overview's KPI card so the visual language stays
// consistent across the platform. The `useCountUp` hook inside the
// card restarts the count-up animation whenever the `value` prop
// changes, so flipping the time range naturally re-animates the
// number.

import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { OverviewKpiCard } from '@/components/overview/overview-kpi-card';
import { type AnalyticsKpis as Kpis } from '@/lib/analytics-data';

interface AnalyticsKpisProps {
  kpis: Kpis;
  rangeKey: string; // accepted to keep the prop surface consistent; not used here
}

export function AnalyticsKpis({ kpis }: AnalyticsKpisProps): JSX.Element {
  return (
    <section
      aria-label="Key metrics"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <OverviewKpiCard
        label="Total Incidents"
        value={kpis.totalIncidents}
        secondaryLabel="Across all services"
        icon={Activity}
        tone="critical"
        trend="6.2%"
        trendTone="bad"
      />
      <OverviewKpiCard
        label="Average MTTR"
        value={0}
        displayValue={kpis.averageMttr}
        secondaryLabel="Mean time to resolution"
        icon={Clock}
        tone="success"
        trend="8% lower than previous period"
        trendTone="good"
      />
      <OverviewKpiCard
        label="AI Approval Rate"
        value={kpis.aiApprovalRate}
        secondaryLabel="Recommendations approved by humans"
        icon={ShieldCheck}
        tone="info"
        trend="2.1%"
        trendTone="good"
      />
      <OverviewKpiCard
        label="AI Recommendation Accuracy"
        value={kpis.aiAccuracy}
        secondaryLabel="Confirmed safe by Enkrypt"
        icon={CheckCircle2}
        tone="success"
        trend="1.4%"
        trendTone="good"
      />
    </section>
  );
}
