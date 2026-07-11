// Explainability panel for the incident details page. Surfaces the
// reasoning behind the AI's decision so reviewers can audit it.

import { Lightbulb, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPercent } from '@/lib/format';

export interface ExplainabilityData {
  rootCause?: string;
  confidence?: number;
  evidence?: string[];
  recommendation?: string;
  riskLevel?: string;
}

interface ExplainabilityPanelProps {
  data: ExplainabilityData | null;
}

export function ExplainabilityPanel({ data }: ExplainabilityPanelProps): JSX.Element {
  const empty = data === null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden />
            Explainability
          </CardTitle>
          {empty ? <Badge variant="muted">No data</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Why the AI reached the recommendation it did.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Field label="Root cause">
          {data?.rootCause ?? 'No root cause recorded yet.'}
        </Field>
        <Field label="Confidence">
          {data?.confidence !== undefined ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {data.confidence}/100
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatPercent(data.confidence / 100)})
              </span>
            </div>
          ) : (
            '—'
          )}
        </Field>
        <Field label="Evidence">
          {data?.evidence && data.evidence.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {data.evidence.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            'No evidence captured yet.'
          )}
        </Field>
        <Separator />
        <Field label="Recommendation">
          {data?.recommendation ?? 'No recommendation recorded yet.'}
        </Field>
        {data?.riskLevel ? (
          <Field label="Risk level">
            <Badge variant="muted" className="uppercase">
              {data.riskLevel}
            </Badge>
          </Field>
        ) : null}
        {!empty ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Recommendations are advisory. Human approval is required before any action.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
