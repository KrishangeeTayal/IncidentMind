import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-slate-100 text-slate-700',
        destructive: 'bg-rose-600 text-white',
        outline: 'border border-slate-200 text-slate-700',
        muted: 'bg-slate-50 text-slate-500',
        // Status colors — subtle tinted pills
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        info: 'bg-violet-50 text-violet-700',
        // Severity colors
        critical: 'bg-rose-50 text-rose-700',
        high: 'bg-orange-50 text-orange-700',
        medium: 'bg-amber-50 text-amber-700',
        low: 'bg-sky-50 text-sky-700',
        // AI
        ai: 'bg-violet-50 text-violet-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
