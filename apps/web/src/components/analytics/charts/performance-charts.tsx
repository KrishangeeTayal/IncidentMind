'use client';

import { IncidentTrendChart } from './incident-trend-chart';
import { SeverityDonutChart } from './severity-donut-chart';
import { SourceBarChart } from './source-bar-chart';
import { ResolutionTimeChart } from './resolution-time-chart';
import type { AnalyticsSnapshot } from '@/lib/analytics-data';

interface PerformanceChartsProps {
  snapshot: AnalyticsSnapshot;
  showTotal: boolean;
  showAI: boolean;
  onToggleTotal: () => void;
  onToggleAI: () => void;
}

export function PerformanceCharts({
  snapshot,
  showTotal,
  showAI,
  onToggleTotal,
  onToggleAI,
}: PerformanceChartsProps): JSX.Element {
  return (
    <section
      aria-label="Performance charts"
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      {/* Incident trend spans the full width on lg. */}
      <div className="lg:col-span-2">
        <IncidentTrendChart
          data={snapshot.incidentTrend}
          showTotal={showTotal}
          showAI={showAI}
          onToggleTotal={onToggleTotal}
          onToggleAI={onToggleAI}
        />
      </div>

      <SeverityDonutChart data={snapshot.severityDistribution} />
      <SourceBarChart data={snapshot.sourceBreakdown} />
      <div className="lg:col-span-2">
        <ResolutionTimeChart data={snapshot.resolutionTime} />
      </div>
    </section>
  );
}
