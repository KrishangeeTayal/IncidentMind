// Reusable incident table. Server-rendered. Clicking a row navigates
// to the incident details page.

import Link from 'next/link';
import type { Incident, IncidentSeverity, IncidentStatus } from '@incidentmind/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentSeverityBadge, IncidentStatusBadge } from './incident-severity-badge';
import { formatRelative } from '@/lib/format';

interface IncidentTableProps {
  incidents: Incident[];
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function IncidentTable({
  incidents,
  title = 'Incidents',
  description,
  emptyMessage = 'No incidents to display.',
}: IncidentTableProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {incidents.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[26%]">Incident</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="block max-w-[28ch] truncate font-medium text-foreground hover:underline"
                    >
                      {incident.title}
                    </Link>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {incident.id}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{incident.service}</span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-muted-foreground">
                      {incident.environment}
                    </span>
                  </TableCell>
                  <TableCell>
                    <SeverityCell severity={incident.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusCell status={incident.status} />
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatRelative(incident.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function SeverityCell({ severity }: { severity: IncidentSeverity }): JSX.Element {
  return <IncidentSeverityBadge severity={severity} />;
}

function StatusCell({ status }: { status: IncidentStatus }): JSX.Element {
  return <IncidentStatusBadge status={status} />;
}
