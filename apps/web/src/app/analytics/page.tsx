import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { AnalyticsPageClient } from '@/components/analytics/analytics-page-client';

export const metadata: Metadata = {
  title: 'Analytics',
  description:
    'Operational insights across your production environment: incidents, severity, sources, AI performance, and top patterns.',
};

export default function AnalyticsPage(): JSX.Element {
  return (
    <AppShell>
      <AnalyticsPageClient />
    </AppShell>
  );
}
