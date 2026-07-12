// AI Knowledge Base — purple-accent stat cards summarizing the
// retrieved context (similar incidents, runbooks, SOPs, semantic
// matches, post-mortems). In a live system these numbers come from
// the workflow's context-retrieval step; here they are read-only
// display cards that pair with the AI Copilot panel.

import {
  AlertTriangle,
  BookOpen,
  FileText,
  GraduationCap,
  History,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIKnowledgeBaseProps {
  stats: {
    similarIncidents: number;
    runbooks: number;
    sops: number;
    semanticMatches: number;
    postmortems: number;
  };
}

const ITEMS = [
  {
    key: 'similarIncidents',
    label: 'Similar incidents',
    icon: History,
    desc: 'Past incidents with matching fingerprints.',
  },
  {
    key: 'runbooks',
    label: 'Runbooks',
    icon: BookOpen,
    desc: 'Authoritative remediation guides.',
  },
  {
    key: 'sops',
    label: 'SOPs',
    icon: FileText,
    desc: 'Standard operating procedures.',
  },
  {
    key: 'semanticMatches',
    label: 'Semantic matches',
    icon: Sparkles,
    desc: 'Vector search results from Qdrant.',
  },
  {
    key: 'postmortems',
    label: 'Post-mortems',
    icon: GraduationCap,
    desc: 'Closed-loop learnings from prior incidents.',
  },
] as const;

type Key = (typeof ITEMS)[number]['key'];

const ACCENT: Record<Key, { ring: string; icon: string; bg: string; bar: string }> = {
  similarIncidents: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  runbooks: {
    ring: 'ring-indigo-100',
    icon: 'text-indigo-600',
    bg: 'bg-indigo-50',
    bar: 'bg-indigo-500',
  },
  sops: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  semanticMatches: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
  postmortems: {
    ring: 'ring-blue-100',
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
};

export function AIKnowledgeBase({ stats }: AIKnowledgeBaseProps): JSX.Element {
  const total = Object.values(stats).reduce((acc, n) => acc + n, 0);
  return (
    <Card className="border bg-card">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" aria-hidden />
              AI Knowledge Base
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Context retrieved by the Context Retrieval Agent from Qdrant.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {total} entries
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item) => {
            const value = stats[item.key];
            const meta = ACCENT[item.key];
            const Icon = item.icon;
            return (
              <li
                key={item.key}
                className="card-elevate group rounded-xl border bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg ring-1',
                      meta.bg,
                      meta.ring,
                    )}
                  >
                    <Icon className={cn('h-4 w-4', meta.icon)} aria-hidden />
                  </div>
                  <span className="font-mono text-lg font-semibold tabular-nums">
                    {value.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-medium leading-tight">
                  {item.label}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                  {item.desc}
                </p>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full progress-fill', meta.bar)}
                    style={{
                      width: `${Math.min(100, Math.max(value > 0 ? 18 : 0, (value / Math.max(1, total)) * 100))}%`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
