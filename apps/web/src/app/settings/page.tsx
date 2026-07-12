import type { Metadata } from 'next';
import {
  Box,
  Cpu,
  HeartPulse,
  Layers,
  Package,
  Server,
  Shield,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { APP_NAME } from '@incidentmind/shared';
import { apiGet, ApiError } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Settings',
};

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

const STACK = [
  { name: 'Next.js', role: 'Web app', detail: 'App Router · TypeScript' },
  { name: 'Tailwind CSS', role: 'Styling', detail: 'shadcn/ui design system' },
  { name: 'Prisma', role: 'ORM', detail: 'PostgreSQL' },
  { name: 'Mastra', role: 'AI orchestration', detail: 'Agents + workflows' },
  { name: 'Qdrant', role: 'Vector search', detail: 'RAG (planned)' },
  { name: 'Enkrypt AI', role: 'Safety', detail: 'Guardrails (planned)' },
];

export default async function SettingsPage(): Promise<JSX.Element> {
  const health = await safeGet<HealthResponse>('/api/health');
  const healthy = health?.status === 'ok';

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Project information, technology stack, and system health.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" aria-hidden />
              Project information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <Row label="Application" value={APP_NAME} />
            <Row label="Description" value="AI-powered incident response platform" />
            <Row label="Version" value="0.1.0" />
            <Row label="Build" value="hackathon-foundation" />
            <Row label="Repository" value="incidentmind/" mono />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-muted-foreground" aria-hidden />
              System health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                API health
              </span>
              <Badge variant={healthy ? 'success' : 'destructive'}>
                {healthy ? 'Healthy' : 'Unreachable'}
              </Badge>
            </div>
            {health ? (
              <>
                <Row label="Service" value={health.service} />
                <Row label="Status" value={health.status} />
                <Row label="Last check" value={new Date(health.timestamp).toLocaleString()} />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Could not reach <span className="font-mono">/api/health</span>. The
                backend may be down or this build is running without the API.
              </p>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Database
              </span>
              <Badge variant="muted">PostgreSQL</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                AI runtime
              </span>
              <Badge variant="muted">Mastra</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
              Technology stack
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The components that make up the IncidentMind platform.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
              >
                <div className="rounded-md bg-background p-2 text-muted-foreground">
                  {iconFor(item.name)}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" aria-hidden />
              API endpoints
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Public route handlers exposed by the web app.
            </p>
          </CardHeader>
          <CardContent className="pt-0 text-sm">
            <ul className="space-y-1.5 font-mono text-xs">
              {[
                'GET  /api/health',
                'GET  /api/dashboard',
                'GET  /api/incidents',
                'GET  /api/incidents/:id',
                'POST /api/incidents/:id/approve',
                'POST /api/incidents/:id/reject',
                'GET  /api/incidents/history',
                'GET  /api/analytics',
                'POST /api/alerts',
                'POST /api/workflows/:id/replay',
              ].map((line) => (
                <li
                  key={line}
                  className="rounded-md border bg-muted/30 px-2.5 py-1.5"
                >
                  {line}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
            <p>
              IncidentMind is built for engineers who need to reduce MTTR without
              trading away safety. The platform never deploys fixes automatically
              — every AI recommendation must pass Enkrypt AI evaluation and then
              human approval.
            </p>
            <p>
              This build is a hackathon foundation: the workflow, agents, and
              integrations (Qdrant, Enkrypt) are wired in but real provider
              connections are intentionally not configured. Replace the stubs
              in <span className="font-mono text-foreground">packages/tools</span>{' '}
              and supply API keys via{' '}
              <span className="font-mono text-foreground">.env</span> to go live.
            </p>
            <p className="text-xs">
              <Cpu className="mr-1 inline h-3 w-3" aria-hidden /> Built with Next.js,
              Mastra, Prisma, and shadcn/ui.
            </p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

interface RowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function Row({ label, value, mono }: RowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={`max-w-[60%] truncate text-right ${
          mono ? 'font-mono text-xs' : 'text-sm'
        }`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function iconFor(name: string): JSX.Element {
  switch (name) {
    case 'Next.js':
      return <Box className="h-4 w-4" aria-hidden />;
    case 'Tailwind CSS':
      return <Layers className="h-4 w-4" aria-hidden />;
    case 'Prisma':
      return <Server className="h-4 w-4" aria-hidden />;
    case 'Mastra':
      return <Cpu className="h-4 w-4" aria-hidden />;
    case 'Qdrant':
      return <Package className="h-4 w-4" aria-hidden />;
    case 'Enkrypt AI':
      return <Shield className="h-4 w-4" aria-hidden />;
    default:
      return <Package className="h-4 w-4" aria-hidden />;
  }
}

async function safeGet<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError) {
      // eslint-disable-next-line no-console
      console.warn(`[settings] ${path} failed: ${error.message}`);
    }
    return null;
  }
}
