'use client';

// Reuses the Overview's KPI card so the visual language stays
// consistent across the platform.

import { BookOpen, GraduationCap, Layers, Sparkles } from 'lucide-react';
import { OverviewKpiCard } from '@/components/overview/overview-kpi-card';
import { knowledgeKpis } from '@/lib/knowledge-data';

export function KnowledgeKpis(): JSX.Element {
  return (
    <section
      aria-label="Knowledge metrics"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <OverviewKpiCard
        label="Historical Incidents"
        value={knowledgeKpis.historicalIncidents}
        secondaryLabel="Indexed and searchable"
        icon={Layers}
        tone="info"
        trend="+24 this week"
        trendTone="good"
      />
      <OverviewKpiCard
        label="Runbooks"
        value={knowledgeKpis.runbooks}
        secondaryLabel="AI-generated playbooks"
        icon={BookOpen}
        tone="success"
        trend="+3 this month"
        trendTone="good"
      />
      <OverviewKpiCard
        label="Lessons Learned"
        value={knowledgeKpis.lessonsLearned}
        secondaryLabel="Captured from past incidents"
        icon={GraduationCap}
        tone="warning"
        trend="+11 this month"
        trendTone="good"
      />
      <OverviewKpiCard
        label="Average AI Match Confidence"
        value={knowledgeKpis.averageAiMatchConfidence}
        secondaryLabel="Across semantic searches"
        icon={Sparkles}
        tone="info"
        trend="1.6%"
        trendTone="good"
      />
    </section>
  );
}
