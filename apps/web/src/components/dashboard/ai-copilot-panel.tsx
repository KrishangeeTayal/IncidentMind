// AI Investigation Panel. Shows the workflow status, root cause,
// confidence, recommendation, risk, human approval status, recent
// AI actions, and a progress indicator. All values come from props
// driven by the demo state.

import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PHASE_LABELS, type DemoPhase, PHASE_ORDER } from '@/lib/demo-scenarios';
import type { DemoAction } from '@/hooks/use-demo-mode';

export interface AiCopilotPanelProps {
  phase: DemoPhase;
  progress: number;
  active: boolean;
  rootCause?: string;
  confidence?: number;
  recommendation?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'awaiting';
  recentActions: DemoAction[];
  scenarioTitle?: string;
}

const RISK_META: Record<NonNullable<AiCopilotPanelProps['riskLevel']>, { classes: string }> = {
  Low: { classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Medium: { classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
  High: { classes: 'bg-orange-50 text-orange-700 ring-orange-200' },
  Critical: { classes: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const APPROVAL_META: Record<
  NonNullable<AiCopilotPanelProps['approvalStatus']>,
  { label: string; classes: string; icon: React.ComponentType<{ className?: string }> }
> = {
  awaiting: { label: 'Awaiting decision', classes: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
  approved: { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', classes: 'bg-rose-50 text-rose-700 ring-rose-200', icon: AlertTriangle },
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function AiCopilotPanel({
  phase,
  progress,
  active,
  rootCause,
  confidence,
  recommendation,
  riskLevel,
  approvalStatus = 'awaiting',
  recentActions,
  scenarioTitle,
}: AiCopilotPanelProps): JSX.Element {
  const stepIndex = PHASE_ORDER.indexOf(phase);
  const currentStep = stepIndex >= 0 ? stepIndex + 1 : 0;
  const totalSteps = PHASE_ORDER.length - 1; // exclude 'complete' marker from count
  const pct = active && stepIndex >= 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0;
  const risk = riskLevel ? RISK_META[riskLevel] : null;
  const approval = APPROVAL_META[approvalStatus]!;

  return (
    <Card className="relative overflow-hidden border bg-card">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 ai-gradient"
      />
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2">
              <span className="ai-gradient flex h-7 w-7 items-center justify-center rounded-lg">
                <Brain className="h-3.5 w-3.5 text-white" aria-hidden />
              </span>
              AI Investigation
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {active
                ? 'Multi-agent workflow in progress'
                : 'Idle — start the demo to simulate an incident lifecycle'}
            </p>
          </div>
          {active ? (
            <Badge variant="info" className="uppercase">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden />
              Live
            </Badge>
          ) : (
            <Badge variant="muted" className="uppercase">
              Idle
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* Current step */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium uppercase tracking-wider text-muted-foreground">
              Current step
            </span>
            <span className="font-mono text-muted-foreground">
              {active ? `${currentStep} / ${totalSteps}` : '— / —'}
            </span>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              {active ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
              )}
              <p className="text-sm font-medium">
                {scenarioTitle ? `${scenarioTitle}` : 'No active investigation'}
              </p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {active
                ? PHASE_LABELS[phase] + '…'
                : 'Click Start Demo to simulate a full incident lifecycle.'}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full ai-gradient progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Root cause + confidence */}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldBlock
            label="Root cause"
            value={rootCause ?? 'Awaiting analysis…'}
            icon={Sparkles}
          />
          <FieldBlock
            label="AI confidence"
            value={
              confidence !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-semibold tabular-nums">
                    {confidence}%
                  </span>
                  <ConfidenceBar value={confidence} />
                </div>
              ) : (
                '—'
              )
            }
            icon={Brain}
          />
        </div>

        {/* Recommendation + risk */}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldBlock
            label="Recommendation"
            value={recommendation ?? 'Awaiting generation…'}
            icon={ListChecks}
          />
          <FieldBlock
            label="Risk level"
            value={
              riskLevel && risk ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                    risk.classes,
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {riskLevel}
                </span>
              ) : (
                '—'
              )
            }
            icon={AlertTriangle}
          />
        </div>

        {/* Human approval */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
              <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Human approval
              </p>
              <p className="text-sm font-medium">
                {active
                  ? 'The system never deploys fixes without human approval.'
                  : 'Recommendations require human approval before any action.'}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
              approval.classes,
            )}
          >
            <approval.icon className="h-3 w-3" aria-hidden />
            {approval.label}
          </span>
        </div>

        {/* Recent AI actions */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent AI actions
          </p>
          {recentActions.length === 0 ? (
            <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
              No actions yet. The agent log will populate when a workflow runs.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {recentActions.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border bg-white p-2.5 text-xs"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{a.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatTime(a.timestamp)}
                      </span>
                    </div>
                    {a.detail ? (
                      <p className="mt-0.5 text-muted-foreground">{a.detail}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FieldBlockProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function FieldBlock({ label, value, icon: Icon }: FieldBlockProps): JSX.Element {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <div className="mt-1.5 text-sm leading-snug">{value}</div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }): JSX.Element {
  const pct = Math.max(0, Math.min(100, value));
  const tone =
    pct >= 85
      ? 'bg-emerald-500'
      : pct >= 70
      ? 'bg-amber-500'
      : 'bg-rose-500';
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className={cn('h-full progress-fill', tone)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
