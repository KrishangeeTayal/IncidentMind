'use client';

// Pending Human Decisions — vertical stack of compact approval cards
// with an Approval Queue Summary card on top. No oversized side-by-
// side cards. No donut chart.

import { ShieldCheck } from 'lucide-react';
import { overviewApprovals } from '@/lib/overview-data';
import { ApprovalCard } from './approval-card';
import { ApprovalQueueSummary } from './approval-queue-summary';

export function PendingApprovals(): JSX.Element {
  return (
    <section aria-label="Pending Human Decisions" className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Pending Human Decisions
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {overviewApprovals.length} recommendations waiting on your review ·
            the system will not deploy without your approval.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          Human-in-the-loop
        </span>
      </header>

      <ApprovalQueueSummary />

      <ul className="flex flex-col gap-2.5">
        {overviewApprovals.map((approval) => (
          <li key={approval.id}>
            <ApprovalCard approval={approval} />
          </li>
        ))}
      </ul>
    </section>
  );
}
