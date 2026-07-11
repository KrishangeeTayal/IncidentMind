'use client';

import { Activity, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { APP_NAME } from '@incidentmind/shared';
import { cn } from '@/lib/utils';

const MOBILE_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Incident History', href: '/incidents' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/settings' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/' || pathname.startsWith('/dashboard');
  return pathname.startsWith(href);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function TopNav(): JSX.Element {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Avoid hydration mismatch — render the time only after mount.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <Activity className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <span className="hidden items-center gap-2 text-xs text-slate-600 sm:inline-flex">
          <span className="relative inline-flex h-2 w-2">
            <span
              className="pulse-success absolute inset-0 rounded-full bg-emerald-500/50"
              aria-hidden
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
              aria-hidden
            />
          </span>
          Operational
        </span>
        <span
          suppressHydrationWarning
          className="hidden font-mono text-xs tabular-nums text-slate-500 lg:inline"
        >
          {now ? formatTime(now) : '--:--:--'} UTC
        </span>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-16 z-20 border-b bg-background p-3 md:hidden"
        >
          {MOBILE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm',
                isActive(pathname, item.href)
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
