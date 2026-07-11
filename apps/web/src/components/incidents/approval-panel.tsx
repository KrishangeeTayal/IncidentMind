// Human approval panel. Shows the latest approval decision and the
// approve/reject actions. Server actions are wired through the
// existing API route handlers.

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Approval } from '@incidentmind/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ApprovalBadge } from './incident-severity-badge';
import { formatDateTime } from '@/lib/format';

interface ApprovalPanelProps {
  incidentId: string;
  approvals: Approval[];
}

export function ApprovalPanel({ incidentId, approvals }: ApprovalPanelProps): JSX.Element {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const latest = approvals[0] ?? null;
  const isPending = latest?.decision === 'pending';
  const isDecided = latest && latest.decision !== 'pending';

  const submit = (decision: 'approved' | 'rejected'): void => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/incidents/${incidentId}/${decision}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() || undefined }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setReason('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed');
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {isPending ? (
            <Clock className="h-4 w-4 text-amber-600" aria-hidden />
          ) : isDecided ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
          )}
          Human approval
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The AI never deploys fixes automatically. A human reviewer must approve
          every recommendation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {latest ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <ApprovalBadge decision={latest.decision} />
              <span className="text-xs text-muted-foreground">
                {latest.decidedAt ? formatDateTime(latest.decidedAt) : 'Awaiting decision'}
              </span>
            </div>
            {latest.reason ? (
              <p className="mt-2 text-sm text-muted-foreground">{latest.reason}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No approval has been recorded for this incident.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="approval-reason">Reason (optional)</Label>
          <Textarea
            id="approval-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you approving or rejecting?"
            rows={2}
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => submit('approved')}
            disabled={pending}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            onClick={() => submit('rejected')}
            disabled={pending}
            variant="destructive"
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
