import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { KnowledgePageClient } from '@/components/knowledge/knowledge-page-client';

export const metadata: Metadata = {
  title: 'Knowledge',
  description:
    'AI Memory for historical incidents, semantic retrieval and operational learning.',
};

export default function KnowledgePage(): JSX.Element {
  return (
    <AppShell>
      <KnowledgePageClient />
    </AppShell>
  );
}
