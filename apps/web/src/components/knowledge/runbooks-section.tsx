'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import { RunbookCard } from './runbook-card';
import { knowledgeRunbooks } from '@/lib/knowledge-data';

interface RunbooksSectionProps {
  openId: string | null;
  onOpen: (id: string) => void;
}

export function RunbooksSection({
  openId,
  onOpen,
}: RunbooksSectionProps): JSX.Element {
  return (
    <section
      aria-label="AI generated runbooks"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookOpen className="h-4 w-4 text-slate-500" aria-hidden />
            AI Generated Runbooks
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Playbooks distilled from every historical incident. Open one to see the steps.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
          <Sparkles className="h-2.5 w-2.5" aria-hidden />
          Auto-updated
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {knowledgeRunbooks.map((runbook) => (
          <li key={runbook.id}>
            <RunbookCard
              runbook={runbook}
              isOpen={openId === runbook.id}
              onToggle={() => onOpen(runbook.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
