'use client';

// Analytics page client orchestrator. Owns:
//   - the active time range
//   - per-chart legend visibility
//   - the active incident-pattern modal
// Pure frontend state — no API calls.

import { useMemo, useState } from 'react';
import { AnalyticsHeader } from './analytics-header';
import { AnalyticsKpis } from './analytics-kpis';
import { PerformanceCharts } from './charts/performance-charts';
import { AIPerformanceSection } from './ai-performance-section';
import { IncidentPatternsSection } from './incident-patterns-section';
import { type TimeRange, getAnalyticsSnapshot } from '@/lib/analytics-data';

export function AnalyticsPageClient(): JSX.Element {
  const [range, setRange] = useState<TimeRange>('7d');
  const snapshot = useMemo(() => getAnalyticsSnapshot(range), [range]);

  // Legend visibility for the line chart (Total / AI-handled).
  const [showTotal, setShowTotal] = useState(true);
  const [showAI, setShowAI] = useState(true);

  return (
    <div className="space-y-8">
      <AnalyticsHeader range={range} onRangeChange={setRange} />

      <AnalyticsKpis kpis={snapshot.kpis} rangeKey={range} />

      <PerformanceCharts
        snapshot={snapshot}
        showTotal={showTotal}
        showAI={showAI}
        onToggleTotal={() => setShowTotal((v: boolean) => !v)}
        onToggleAI={() => setShowAI((v: boolean) => !v)}
      />

      <AIPerformanceSection performance={snapshot.aiPerformance} rangeKey={range} />

      <IncidentPatternsSection patterns={snapshot.patterns} rangeKey={range} />
    </div>
  );
}
