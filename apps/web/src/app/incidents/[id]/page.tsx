import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { WorkspacePageClient } from '@/components/workspace/workspace-page-client';
import { getDemoIncident, type DemoIncident } from '@/lib/demo-incidents';

interface IncidentDetailsPageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Incident Workspace',
  description:
    'The investigation room: timeline, evidence, AI reasoning, similar incidents, recommendation, and resolution.',
};

export default function IncidentWorkspacePage({
  params,
}: IncidentDetailsPageProps): JSX.Element {
  // The Overview's "Open Incident" button navigates to a synthetic demo
  // id that doesn't exist in the database. The workspace should always
  // have something meaningful to show, so we look up the demo record
  // first; the API fetch is skipped because the page is intentionally
  // demo-driven.
  const incident: DemoIncident | null = getDemoIncident(params.id);

  if (!incident) {
    notFound();
  }

  return (
    <AppShell>
      <WorkspacePageClient incident={incident} />
    </AppShell>
  );
}
