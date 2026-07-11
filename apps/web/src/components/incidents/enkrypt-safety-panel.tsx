// Enkrypt safety panel — surfaces the safety / hallucination / risk
// evaluation for the current recommendation.

import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPercent } from '@/lib/format';

export type EnkryptVerdict = 'pass' | 'warn' | 'fail';

export interface EnkryptData {
  verdict?: EnkryptVerdict;
  hallucinationRisk?: number;
  safetyScore?: number;
  riskScore?: number;
  confidence?: number;
  reasons?: string[];
  stopBeforeApproval?: boolean;
}

interface EnkryptSafetyPanelProps {
  data: EnkryptData | null;
}

const VERDICT_META: Record<
  EnkryptVerdict,
  { label: string; variant: 'success' | 'warning' | 'destructive'; icon: typeof ShieldCheck }
> = {
  pass: { label: 'Pass', variant: 'success', icon: ShieldCheck },
  warn: { label: 'Warn', variant: 'warning', icon: ShieldAlert },
  fail: { label: 'Blocked', variant: 'destructive', icon: ShieldX },
};

export function EnkryptSafetyPanel({ data }: EnkryptSafetyPanelProps): JSX.Element {
  const empty = data === null;
  const verdict = data?.verdict ?? null;
  const meta = verdict ? VERDICT_META[verdict] : null;
  const Icon = meta?.icon ?? ShieldCheck;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            Enkrypt safety
          </CardTitle>
          {meta ? (
            <Badge variant={meta.variant} className="uppercase">
              {meta.label}
            </Badge>
          ) : (
            <Badge variant="muted">No evaluation</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Guardrail and hallucination check on the AI output.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Metric
          label="Hallucination risk"
          value={data?.hallucinationRisk}
          threshold={0.7}
          higherIsBad
        />
        <Metric
          label="Safety score"
          value={data?.safetyScore}
          threshold={0.6}
        />
        <Metric
          label="Risk analysis"
          value={data?.riskScore}
          threshold={0.7}
          higherIsBad
        />
        <Metric
          label="Confidence"
          value={data?.confidence}
          threshold={0.6}
        />
        <Separator />
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reasons
          </p>
          {empty ? (
            <p className="text-sm text-muted-foreground">
              Enkrypt has not evaluated this incident yet. The check runs after the
              Resolution Recommendation step.
            </p>
          ) : data?.reasons && data.reasons.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {data.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No reasons recorded.</p>
          )}
        </div>
        {!empty && data?.stopBeforeApproval ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <p className="font-medium">Recommendation blocked.</p>
            <p className="mt-1 text-rose-900/80">
              The workflow stopped before human approval because Enkrypt flagged a
              safety concern. Review the reasons above before taking action.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface MetricProps {
  label: string;
  value: number | undefined;
  threshold: number;
  higherIsBad?: boolean;
}

function Metric({ label, value, threshold, higherIsBad }: MetricProps): JSX.Element {
  const pct = value !== undefined ? Math.max(0, Math.min(1, value)) : null;
  const triggered =
    pct !== null && (higherIsBad ? pct > threshold : pct < threshold);
  const tone = pct === null
    ? 'text-muted-foreground'
    : triggered
    ? 'text-rose-600'
    : 'text-emerald-600';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={`font-mono text-xs ${tone}`}>
          {pct !== null ? formatPercent(pct) : '—'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${
            triggered ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: pct !== null ? `${Math.max(pct * 100, 2)}%` : '0%' }}
        />
      </div>
    </div>
  );
}
