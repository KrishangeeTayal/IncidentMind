import { redirect } from 'next/navigation';
import { ROUTES } from '@incidentmind/shared';

/**
 * Root entry point. The dashboard is the canonical landing page for
 * signed-in users; auth will gate this later.
 */
export default function RootPage(): never {
  redirect(ROUTES.dashboard as Parameters<typeof redirect>[0]);
}
