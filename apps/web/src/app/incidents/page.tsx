import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Incident, IncidentSeverity, IncidentStatus } from '@incidentmind/shared';
import { AppShell } from '@/components/app-shell';
import { IncidentTable } from '@/components/incidents/incident-table';
import { IncidentFilters } from '@/components/incidents/incident-filters';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet, ApiError } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Incident history',
};

interface PageProps {
  searchParams?: {
    q?: string;
    status?: string;
    severity?: string;
    service?: string;
  };
}

const STATUS_VALUES: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved'];
const SEVERITY_VALUES: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

function isStatus(v: string | undefined): v is IncidentStatus {
  return v !== undefined && (STATUS_VALUES as string[]).includes(v);
}
function isSeverity(v: string | undefined): v is IncidentSeverity {
  return v !== undefined && (SEVERITY_VALUES as string[]).includes(v);
}

export default async function IncidentsHistoryPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const sp = searchParams ?? {};

  // Build the upstream API query. The /api/incidents route supports
  // status / severity / service / limit / cursor. Client-side search
  // (`q`) is applied after the fetch.
  const upstream = new URLSearchParams();
  upstream.set('limit', '100');
  if (isStatus(sp.status)) upstream.set('status', sp.status);
  if (isSeverity(sp.severity)) upstream.set('severity', sp.severity);
  if (sp.service && sp.service.trim().length > 0) {
    upstream.set('service', sp.service.trim());
  }

  let incidents: Incident[] = [];
  try {
    incidents = await apiGet<Incident[]>(`/api/incidents?${upstream.toString()}`);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      // eslint-disable-next-line no-console
      console.warn('[incidents-history] apiGet failed:', error);
    }
  }

  const q = sp.q?.trim().toLowerCase();
  const filtered = q
    ? incidents.filter((i) =>
        [i.title, i.service, i.id, i.description ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : incidents;

  const hasFilters = Boolean(sp.q || sp.status || sp.severity || sp.service);

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Incident history</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search past incidents. Click any row to open the full record.
        </p>
      </header>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-9 w-full rounded-md bg-muted" />}>
            <IncidentFilters />
          </Suspense>
        </CardContent>
      </Card>

      <IncidentTable
        title={hasFilters ? 'Filtered results' : 'All incidents'}
        description={
          filtered.length === incidents.length
            ? `${incidents.length} incident${incidents.length === 1 ? '' : 's'}.`
            : `${filtered.length} of ${incidents.length} match the current filters.`
        }
        incidents={filtered}
        emptyMessage="No incidents match the current filters."
      />
    </AppShell>
  );
}
