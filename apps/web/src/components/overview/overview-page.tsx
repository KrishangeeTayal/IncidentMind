'use client';

// Overview (Mission Control) page orchestrator. New layout:
// page header + 5 KPIs + (Trend chart + AI Investigation) +
// Pending Approvals (with the new Approval Queue Summary) +
// Active Incidents table.
//
// The "Incidents by Service" donut chart has been removed and
// replaced with the compact Approval Queue Summary card sitting
// above the stacked approval cards. All other functionality
// (KPI data, AI investigation engine, approvals, tables) is
// preserved.

import { MissionControlHeader } from './mission-control-header';
import { OverviewKpis } from './overview-kpis';
import { IncidentTrendChart } from './incident-trend-chart';
import { ActiveIncidentsTable } from './active-incidents-table';
import { PendingApprovals } from './pending-approvals';
import { AIInvestigationEngine } from './ai-investigation-engine';

export function OverviewPage(): JSX.Element {
  return (
    <div className="space-y-8">
      <MissionControlHeader />

      <OverviewKpis />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncidentTrendChart />
        </div>
        <div className="lg:col-span-1">
          <AIInvestigationEngine />
        </div>
      </div>

      <PendingApprovals />

      <ActiveIncidentsTable limit={4} />
    </div>
  );
}
