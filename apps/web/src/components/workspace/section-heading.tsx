// Reusable section header used by every workspace section. Establishes
// consistent visual hierarchy across the 7 sections.

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  index: number; // 1..7
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  id?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function SectionHeading({
  index,
  title,
  subtitle,
  icon: Icon,
  id,
  className,
  actions,
}: SectionHeadingProps): JSX.Element {
  return (
    <header
      id={id ? `${id}-heading` : undefined}
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center im-card text-[11px] font-semibold text-slate-700">
          {String(index).padStart(2, '0')}
        </div>
        <div>
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-slate-500" aria-hidden /> : null}
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
