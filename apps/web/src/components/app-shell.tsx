// Application shell: top bar (full width) + sidebar (below, on the left)
// + main content. Top bar carries the brand and platform status;
// sidebar carries the navigation.

import { TopBar } from './top-bar';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopBar />
      <div className="flex min-h-[calc(100vh-4rem)] flex-1">
        <Sidebar />
        <main className="flex-1 px-5 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
