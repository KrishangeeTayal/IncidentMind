'use client';

// Filter bar for the incident history page. Client component because
// the controls drive a router.refresh to re-fetch server data.

import { useTransition, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type {
  IncidentSeverity,
  IncidentStatus,
} from '@incidentmind/shared';

const STATUS_OPTIONS: Array<{ value: IncidentStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'resolved', label: 'Resolved' },
];

const SEVERITY_OPTIONS: Array<{ value: IncidentSeverity | ''; label: string }> = [
  { value: '', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function IncidentFilters(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [severity, setSeverity] = useState(params.get('severity') ?? '');
  const [service, setService] = useState(params.get('service') ?? '');

  const apply = (): void => {
    const next = new URLSearchParams();
    if (search.trim()) next.set('q', search.trim());
    if (status) next.set('status', status);
    if (severity) next.set('severity', severity);
    if (service.trim()) next.set('service', service.trim());
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/incidents?${qs}` : '/incidents');
    });
  };

  const clear = (): void => {
    setSearch('');
    setStatus('');
    setSeverity('');
    setService('');
    startTransition(() => router.push('/incidents'));
  };

  const hasFilters = search || status || severity || service;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <label
          htmlFor="incident-search"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="incident-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') apply();
            }}
            placeholder="Search by title, service, or ID"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
        <div className="space-y-1.5">
          <label
            htmlFor="filter-status"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Status
          </label>
          <Select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="min-w-[10rem]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="filter-severity"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Severity
          </label>
          <Select
            id="filter-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="min-w-[10rem]"
          >
            {SEVERITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="filter-service"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Service
          </label>
          <Input
            id="filter-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. checkout-api"
            className="min-w-[10rem]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={apply} disabled={pending}>
          Apply
        </Button>
        {hasFilters ? (
          <Button onClick={clear} variant="ghost" size="sm" disabled={pending}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
