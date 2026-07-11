// Renders a list of evidence items collected by the RCA agent.

import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EvidenceListProps {
  evidence: string[];
}

export function EvidenceList({ evidence }: EvidenceListProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Evidence</CardTitle>
        <p className="text-sm text-muted-foreground">
          {evidence.length === 0
            ? 'No evidence captured yet.'
            : `${evidence.length} item${evidence.length === 1 ? '' : 's'} supporting the root cause analysis.`}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {evidence.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            The RCA agent will surface supporting evidence here once it runs.
          </p>
        ) : (
          <ul className="space-y-2">
            {evidence.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm"
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
