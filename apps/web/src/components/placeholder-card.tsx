import { cn } from '@/lib/utils';

interface PlaceholderCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Visual placeholder used on pages that have no real UI yet.
 * Communicates "this is a stub" without committing to a specific component.
 */
export function PlaceholderCard({
  title,
  description,
  className,
  children,
}: PlaceholderCardProps): JSX.Element {
  return (
    <section
      className={cn(
        'rounded-lg border border-dashed bg-card p-6 text-card-foreground shadow-sm',
        className,
      )}
    >
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-base text-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
