'use client';

// Sidebar — sits below the top bar, carries the navigation and the
// Enkrypt AI guard card at the bottom. Calm, minimal, light active
// state, thin blue indicator. No visual weight where it isn't needed.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import {
  BarChart3,
  BookOpen,
  History,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    match: (p) => p === '/dashboard' || p === '/',
  },
  {
    label: 'Incidents',
    href: '/incidents',
    icon: History,
    match: (p) => p.startsWith('/incidents'),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    match: (p) => p.startsWith('/analytics'),
  },
  {
    label: 'Knowledge',
    href: '/knowledge',
    icon: BookOpen,
    match: (p) => p.startsWith('/knowledge'),
  },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname() ?? '';

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-100 bg-white md:flex md:flex-col">
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Primary">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-violet-50 font-medium text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-violet-600 transition-opacity duration-200',
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-30',
                )}
              />
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active
                    ? 'text-violet-600'
                    : 'text-slate-400 group-hover:text-slate-500',
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Enkrypt AI guard */}
      <div className="m-3 mt-1 rounded-xl border border-slate-200/80 bg-white p-3.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-violet-50 text-violet-600"
            aria-hidden
          >
            <ShieldCheck className="h-3 w-3" />
          </span>
          Enkrypt AI
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Guarding every recommendation.
        </p>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
        v0.1.0 · Enterprise build
      </div>
    </aside>
  );
}
