'use client';

// Workspace page orchestrator. Owns the approval + resolution state and
// threads the right values into each section.

import { useState } from 'react';
import type { DemoIncident } from '@/lib/demo-incidents';
import type { ApprovalDecision } from '@/lib/overview-data';
import { WorkspaceHeader } from './workspace-header';
import { InvestigationTimeline } from './investigation-timeline';
import { EvidenceSection } from './evidence-section';
import { AIReasoningSection } from './ai-reasoning-section';
import { SimilarIncidentsSection } from './similar-incidents-section';
import { RecommendationSection } from './recommendation-section';
import { EnkryptSafetySection } from './enkrypt-safety-section';
import { ResolutionSection } from './resolution-section';

interface WorkspacePageClientProps {
  incident: DemoIncident;
}

export function WorkspacePageClient({
  incident,
}: WorkspacePageClientProps): JSX.Element {
  const [approval, setApproval] = useState<ApprovalDecision>('pending');

  const activeStep = incident.timeline.find((s) => s.state === 'active')?.id;

  return (
    <div className="space-y-8">
      <WorkspaceHeader
        incident={incident}
        approval={approval}
        onApprove={() => setApproval('approved')}
        onReject={() => setApproval('rejected')}
        onReset={() => setApproval('pending')}
      />

      <InvestigationTimeline steps={incident.timeline} {...(activeStep ? { activeStepId: activeStep } : {})} />

      <EvidenceSection evidence={incident.evidence} />

      <AIReasoningSection reasoning={incident.reasoning} />

      <SimilarIncidentsSection incidents={incident.similarIncidents} />

      <RecommendationSection
        recommendation={incident.recommendation}
        approval={approval}
        onApprove={() => setApproval('approved')}
        onReject={() => setApproval('rejected')}
        onReset={() => setApproval('pending')}
      />

      <EnkryptSafetySection safety={incident.enkrypt} />

      <ResolutionSection approval={approval} />
    </div>
  );
}
