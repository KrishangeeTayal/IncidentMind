'use client';

import { BookOpen, Sparkles } from 'lucide-react';

export function KnowledgeHeader(): JSX.Element {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI Memory
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          742 incidents indexed
        </span>
      </div>
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
        <BookOpen className="h-5 w-5 text-slate-500" aria-hidden />
        Knowledge
      </h1>
      <p className="max-w-2xl text-sm text-slate-500">
        AI Memory for historical incidents, semantic retrieval and operational learning.
      </p>
    </header>
  );
}
