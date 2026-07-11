'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type DemoPhase,
  PHASE_LABELS,
  PHASE_ORDER,
  pickDemoScenario,
  seedToIncident,
  type DemoIncidentSeed,
} from '@/lib/demo-scenarios';
import type { Incident, IncidentSeverity } from '@incidentmind/shared';

export interface DemoState {
  running: boolean;
  phase: DemoPhase;
  /** The scenario currently being simulated, if any. */
  scenario: DemoIncidentSeed | null;
  /** The synthetic incident that the demo added to the live feed. */
  incident: Incident | null;
  /** Per-phase progress 0..1. */
  progress: number;
  /** Per-phase logs the user sees in the AI Copilot panel. */
  recentActions: DemoAction[];
}

export interface DemoAction {
  id: string;
  timestamp: number;
  phase: DemoPhase;
  title: string;
  detail?: string;
}

const SEVERITY_BUMP: Record<IncidentSeverity, number> = {
  critical: 1,
  high: 1,
  medium: 0,
  low: 0,
};

const PHASE_DURATION_MS = 1600;
const KNOWLEDGE_HOLD_MS = 4000;

export interface DemoControls {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Frontend-only demo simulator. Walks the workflow timeline and
 * produces synthetic state that the dashboard consumes — no backend
 * calls, no API changes, no auth.
 */
export function useDemoMode(
  onIncidentCreated: (incident: Incident) => void,
  onIncidentUpdated: (incident: Incident) => void,
  onIncidentCleared: (id: string) => void,
  onPhaseAdvanced: (phase: DemoPhase, scenario: DemoIncidentSeed | null) => void,
): { state: DemoState; controls: DemoControls } {
  const [state, setState] = useState<DemoState>({
    running: false,
    phase: 'idle',
    scenario: null,
    incident: null,
    progress: 0,
    recentActions: [],
  });

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const pushAction = useCallback(
    (action: Omit<DemoAction, 'id' | 'timestamp'>) => {
      setState((s) => ({
        ...s,
        recentActions: [
          {
            id: `${action.phase}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: Date.now(),
            ...action,
          },
          ...s.recentActions,
        ].slice(0, 8),
      }));
    },
    [],
  );

  const stop = useCallback(() => {
    clearTimers();
    setState((s) => ({
      ...s,
      running: false,
      phase: 'idle',
      progress: 0,
    }));
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    if (stateRef.current.incident) {
      onIncidentCleared(stateRef.current.incident.id);
    }
    setState({
      running: false,
      phase: 'idle',
      scenario: null,
      incident: null,
      progress: 0,
      recentActions: [],
    });
  }, [clearTimers, onIncidentCleared]);

  const start = useCallback(() => {
    clearTimers();
    const scenario = pickDemoScenario();
    const incident = seedToIncident(scenario, 'investigating');
    const ts = Date.now();

    setState({
      running: true,
      phase: 'idle',
      scenario,
      incident,
      progress: 0,
      recentActions: [
        {
          id: `init-${ts}`,
          timestamp: ts,
          phase: 'idle',
          title: 'Demo initialized',
          detail: `Scenario: ${scenario.scenarioKey}`,
        },
      ],
    });

    onIncidentCreated(incident);
    onPhaseAdvanced('idle', scenario);

    let stepIdx = 0;
    const steps = PHASE_ORDER; // starts at 'alert'

    const advance = (): void => {
      const current = steps[stepIdx];
      if (!current) {
        // End of run
        setState((s) => ({ ...s, phase: 'complete', progress: 1, running: false }));
        onPhaseAdvanced('complete', scenario);
        return;
      }

      setState((s) => ({ ...s, phase: current, progress: 0 }));
      onPhaseAdvanced(current, scenario);

      // Per-phase side effects
      if (current === 'resolved') {
        const updated: Incident = {
          ...incident,
          status: 'resolved',
          updatedAt: new Date().toISOString(),
        };
        onIncidentUpdated(updated);
        setState((s) => ({ ...s, incident: updated }));
      }
      if (current === 'mitigation') {
        const updated: Incident = {
          ...incident,
          status: 'mitigated',
          updatedAt: new Date().toISOString(),
        };
        onIncidentUpdated(updated);
        setState((s) => ({ ...s, incident: updated }));
      }

      // Push a human-readable action entry
      pushAction({
        phase: current,
        title: PHASE_LABELS[current],
        detail: detailFor(current, scenario),
      });

      // Smooth progress for the in-phase bar
      const startedAt = Date.now();
      const tick = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const p = Math.min(1, elapsed / PHASE_DURATION_MS);
        setState((s) => ({ ...s, progress: p }));
      }, 50);
      timers.current.push(tick as unknown as ReturnType<typeof setTimeout>);

      const hold = current === 'knowledge' ? KNOWLEDGE_HOLD_MS : PHASE_DURATION_MS;
      const next = setTimeout(() => {
        clearInterval(tick);
        stepIdx += 1;
        if (stepIdx >= steps.length) {
          setState((s) => ({ ...s, phase: 'complete', progress: 1, running: false }));
          onPhaseAdvanced('complete', scenario);
        } else {
          advance();
        }
      }, hold);
      timers.current.push(next);
    };

    // Brief delay before the first visible phase
    const startDelay = setTimeout(advance, 400);
    timers.current.push(startDelay);
  }, [clearTimers, onIncidentCreated, onIncidentUpdated, onPhaseAdvanced, pushAction]);

  // Bump severity counts by 1 to satisfy the "tier distribution" feel.
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    state: { ...state, recentActions: state.recentActions.slice(0, 6) },
    controls: { start, stop, reset },
  };
}

function detailFor(phase: DemoPhase, scenario: DemoIncidentSeed): string | undefined {
  switch (phase) {
    case 'alert':
      return `PagerDuty alert opened · ${scenario.scenarioKey}`;
    case 'classification':
      return `Severity classified as ${scenario.severity.toUpperCase()} (confidence 94%)`;
    case 'context':
      return 'Retrieved 5 similar incidents, 3 runbooks, 2 SOPs';
    case 'rca':
      return scenario.evidence[0] ?? 'Root cause identified';
    case 'recommendation':
      return `Risk: ${scenario.riskLevel} · Confidence: ${scenario.confidence}%`;
    case 'enkrypt':
      return 'Enkrypt safety gate: pass · hallucination risk low';
    case 'awaiting_approval':
      return 'Awaiting human approval — system will not auto-deploy';
    case 'mitigation':
      return 'Mitigation applied via change request #4821';
    case 'resolved':
      return 'All systems nominal · p99 latency recovered';
    case 'postmortem':
      return 'Postmortem draft attached to incident record';
    case 'knowledge':
      return 'Indexed 2 vectors in Qdrant for future retrieval';
    case 'complete':
      return 'Run complete';
    case 'idle':
    default:
      return undefined;
  }
}

void SEVERITY_BUMP; // reserved for future tier-shifting effects
