import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps): JSX.Element {
  const r =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'lg'
      ? 'rounded-xl'
      : rounded === 'sm'
      ? 'rounded-md'
      : 'rounded-lg';
  return (
    <div
      className={cn('skeleton-shimmer', r, className)}
      aria-hidden
      {...props}
    />
  );
}
