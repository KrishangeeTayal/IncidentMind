'use client';

// Three filter rows: Severity, Service, Status. Each chip is toggleable
// and visually reflects its active state with the platform's tone
// colours (no large coloured backgrounds).

import { cn } from '@/lib/utils';
import {
  SEVERITY_FILTERS,
  SERVICE_FILTERS,
  STATUS_FILTERS,
  type ServiceFilter,
  type SeverityFilter,
  type StatusFilter,
} from '@/lib/knowledge-data';

interface FilterChipsProps {
  severities: Set<SeverityFilter['id']>;
  services: Set<ServiceFilter['id']>;
  statuses: Set<StatusFilter['id']>;
  onToggleSeverity: (id: SeverityFilter['id']) => void;
  onToggleService: (id: ServiceFilter['id']) => void;
  onToggleStatus: (id: StatusFilter['id']) => void;
  onClear: () => void;
  hasAnyFilter: boolean;
  resultCount: number;
}

const SEVERITY_TONE: Record<SeverityFilter['id'], string> = {
  critical: 'data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700 data-[active=true]:border-rose-200 data-[active=true]:ring-rose-100',
  high:     'data-[active=true]:bg-orange-50 data-[active=true]:text-orange-700 data-[active=true]:border-orange-200 data-[active=true]:ring-orange-100',
  medium:   'data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200 data-[active=true]:ring-amber-100',
  low:      'data-[active=true]:bg-sky-50 data-[active=true]:text-sky-700 data-[active=true]:border-sky-200 data-[active=true]:ring-sky-100',
};

const SEVERITY_DOT: Record<SeverityFilter['id'], string> = {
  critical: 'bg-rose-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-sky-500',
};

const SERVICE_TONE: Record<ServiceFilter['id'], string> = {
  payments:       'data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200 data-[active=true]:ring-blue-100',
  redis:          'data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700 data-[active=true]:border-rose-200 data-[active=true]:ring-rose-100',
  database:       'data-[active=true]:bg-violet-50 data-[active=true]:text-violet-700 data-[active=true]:border-violet-200 data-[active=true]:ring-violet-100',
  'api-gateway':  'data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-200 data-[active=true]:ring-emerald-100',
  infrastructure: 'data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200 data-[active=true]:ring-amber-100',
};

const SERVICE_DOT: Record<ServiceFilter['id'], string> = {
  payments: 'bg-blue-500',
  redis: 'bg-rose-500',
  database: 'bg-violet-500',
  'api-gateway': 'bg-emerald-500',
  infrastructure: 'bg-amber-500',
};

const STATUS_TONE: Record<StatusFilter['id'], string> = {
  resolved:   'data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-200 data-[active=true]:ring-emerald-100',
  monitoring: 'data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200 data-[active=true]:ring-blue-100',
  open:       'data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200 data-[active=true]:ring-amber-100',
};

const STATUS_DOT: Record<StatusFilter['id'], string> = {
  resolved: 'bg-emerald-500',
  monitoring: 'bg-blue-500',
  open: 'bg-amber-500',
};

interface ChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  tone: string;
  dot: string;
}

function Chip({
  label,
  active,
  onToggle,
  tone,
  dot,
}: ChipProps): JSX.Element {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onToggle}
      data-active={active}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600',
        'transition-all hover:border-slate-300 hover:text-slate-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
        'ring-1 ring-transparent',
        tone,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label}
    </button>
  );
}

export function FilterChips({
  severities,
  services,
  statuses,
  onToggleSeverity,
  onToggleService,
  onToggleStatus,
  onClear,
  hasAnyFilter,
  resultCount,
}: FilterChipsProps): JSX.Element {
  return (
    <div className="space-y-2.5">
      <FilterRow label="Severity">
        {SEVERITY_FILTERS.map((s) => (
          <div key={s.id} className="contents">
            <Chip
              label={s.label}
              active={severities.has(s.id)}
              onToggle={() => onToggleSeverity(s.id)}
              tone={SEVERITY_TONE[s.id]}
              dot={SEVERITY_DOT[s.id]}
            />
          </div>
        ))}
      </FilterRow>

      <FilterRow label="Service">
        {SERVICE_FILTERS.map((s) => (
          <div key={s.id} className="contents">
            <Chip
              label={s.label}
              active={services.has(s.id)}
              onToggle={() => onToggleService(s.id)}
              tone={SERVICE_TONE[s.id]}
              dot={SERVICE_DOT[s.id]}
            />
          </div>
        ))}
      </FilterRow>

      <FilterRow label="Status">
        {STATUS_FILTERS.map((s) => (
          <div key={s.id} className="contents">
            <Chip
              label={s.label}
              active={statuses.has(s.id)}
              onToggle={() => onToggleStatus(s.id)}
              tone={STATUS_TONE[s.id]}
              dot={STATUS_DOT[s.id]}
            />
          </div>
        ))}
      </FilterRow>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-slate-500">
          <span className="font-mono font-semibold text-slate-700">{resultCount}</span>{' '}
          {resultCount === 1 ? 'incident' : 'incidents'} match
          {hasAnyFilter ? ' your filters' : ''}.
        </p>
        {hasAnyFilter ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
