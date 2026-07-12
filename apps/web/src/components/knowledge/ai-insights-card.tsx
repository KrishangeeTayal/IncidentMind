'use client';

import { Lightbulb, RefreshCcw, Sparkles } from 'lucide-react';
import { aiInsight } from '@/lib/knowledge-data';

export function AiInsightsCard(): JSX.Element {
  return (
    <section
      aria-label="AI insights"
      className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 p-5 shadow-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {aiInsight.title}
            </h2>
            <p className="text-[11px] text-slate-500">{aiInsight.body}</p>
          </div>
          <div className="ml-auto inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
              {aiInsight.confidence}% confidence
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <RefreshCcw className="h-3 w-3" aria-hidden />
              {aiInsight.lastUpdated}
            </span>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {aiInsight.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-white/70 p-3"
            >
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700"
              >
                <Lightbulb className="h-3 w-3" />
              </span>
              <p className="text-xs leading-relaxed text-slate-700">{bullet}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
