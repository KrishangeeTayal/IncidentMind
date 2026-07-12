'use client';

// Knowledge page client orchestrator. Owns:
//   - the search query
//   - the active filter chips (severity / service / status)
//   - the active detail-drawer incident id
//   - the active expanded runbook id
// Pure frontend state — no API calls.

import { useMemo, useState } from 'react';
import { KnowledgeHeader } from './knowledge-header';
import { KnowledgeKpis } from './knowledge-kpis';
import { SemanticSearch } from './semantic-search';
import { FilterChips } from './filter-chips';
import { HistoricalIncidentsSection } from './historical-incidents-section';
import { RunbooksSection } from './runbooks-section';
import { AiInsightsCard } from './ai-insights-card';
import { IncidentDrawerHost } from './incident-detail-drawer';
import {
  knowledgeIncidents,
  type KnowledgeIncident,
  type ServiceFilter,
  type SeverityFilter,
  type StatusFilter,
} from '@/lib/knowledge-data';

export function KnowledgePageClient(): JSX.Element {
  const [query, setQuery] = useState('');
  const [severities, setSeverities] = useState<Set<SeverityFilter['id']>>(new Set());
  const [services, setServices] = useState<Set<ServiceFilter['id']>>(new Set());
  const [statuses, setStatuses] = useState<Set<StatusFilter['id']>>(new Set());
  const [openIncidentId, setOpenIncidentId] = useState<string | null>(null);
  const [openRunbookId, setOpenRunbookId] = useState<string | null>(null);

  const filteredIncidents = useMemo<ReadonlyArray<KnowledgeIncident>>(() => {
    const q = query.trim().toLowerCase();
    return knowledgeIncidents.filter((i) => {
      if (severities.size > 0 && !severities.has(i.severity)) return false;
      if (services.size > 0 && !services.has(i.service)) return false;
      if (statuses.size > 0 && !statuses.has(i.status)) return false;
      if (q.length === 0) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.rootCause.toLowerCase().includes(q) ||
        i.service.toLowerCase().includes(q) ||
        i.lessonsLearned.toLowerCase().includes(q)
      );
    });
  }, [query, severities, services, statuses]);

  const openIncident = openIncidentId
    ? knowledgeIncidents.find((i) => i.id === openIncidentId) ?? null
    : null;

  return (
    <div className="space-y-8">
      <KnowledgeHeader />

      <KnowledgeKpis />

      <section
        aria-label="Search and filters"
        className="space-y-3 im-card p-6"
      >
        <SemanticSearch value={query} onChange={setQuery} />
        <FilterChips
          severities={severities}
          services={services}
          statuses={statuses}
          onToggleSeverity={(id) =>
            setSeverities((prev: Set<SeverityFilter['id']>) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onToggleService={(id) =>
            setServices((prev: Set<ServiceFilter['id']>) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onToggleStatus={(id) =>
            setStatuses((prev: Set<StatusFilter['id']>) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onClear={() => {
            setSeverities(new Set());
            setServices(new Set());
            setStatuses(new Set());
          }}
          hasAnyFilter={
            severities.size > 0 || services.size > 0 || statuses.size > 0
          }
          resultCount={filteredIncidents.length}
        />
      </section>

      <HistoricalIncidentsSection
        incidents={filteredIncidents}
        onOpen={(id) => setOpenIncidentId(id)}
        activeIncidentId={openIncidentId}
      />

      <RunbooksSection
        openId={openRunbookId}
        onOpen={(id) =>
          setOpenRunbookId((prev: string | null) => (prev === id ? null : id))
        }
      />

      <AiInsightsCard />

      {/* Detail drawer is always mounted so its open/close animates. */}
      <IncidentDrawerHost
        incident={openIncident}
        onClose={() => setOpenIncidentId(null)}
      />
    </div>
  );
}
