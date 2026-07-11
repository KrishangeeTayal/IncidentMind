import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { OverviewPage } from '@/components/overview/overview-page';

export const metadata: Metadata = {
  title: 'Overview',
  description:
    'Mission Control: live production incidents, AI investigations, and pending human decisions.',
};

export default function DashboardPage(): JSX.Element {
  return (
    <AppShell>
      <OverviewPage />
    </AppShell>
  );
}
