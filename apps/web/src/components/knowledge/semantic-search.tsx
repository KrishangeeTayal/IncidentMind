'use client';

import { Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface SemanticSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function SemanticSearch({ value, onChange }: SemanticSearchProps): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="text"
          inputMode="search"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="Search incidents, root causes, services or symptoms..."
          aria-label="Search knowledge base"
          className={cn(
            'h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400',
            'transition-all',
            'focus-visible:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
          )}
        />
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="text-[11px] text-slate-400">
        Tip: try{' '}
        <button
          type="button"
          onClick={() => onChange('redis')}
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          redis
        </button>
        ,{' '}
        <button
          type="button"
          onClick={() => onChange('timeout')}
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          timeout
        </button>
        , or{' '}
        <button
          type="button"
          onClick={() => onChange('pool')}
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          pool
        </button>
        .
      </p>
    </div>
  );
}
