// Constants shared across apps. Keep this file dependency-free.

export const APP_NAME = 'IncidentMind' as const;

export const DEFAULT_WEB_PORT = 3000 as const;
export const DEFAULT_MASTRA_PORT = 4111 as const;

// Routes used by the web app. Kept here so they can be referenced from
// the UI package and any future tests without circular imports.
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  incidentDetails: '/incidents/[id]',
  incidentHistory: '/incidents',
  analytics: '/analytics',
  settings: '/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// API route paths (server side). Exposed so callers can build URLs without
// duplicating string literals across the codebase.
export const API_ROUTES = {
  health: '/api/health',
  dashboard: '/api/dashboard',
  incidents: '/api/incidents',
  incident: (id: string): string => `/api/incidents/${id}`,
  incidentApprove: (id: string): string => `/api/incidents/${id}/approve`,
  incidentReject: (id: string): string => `/api/incidents/${id}/reject`,
  incidentHistory: '/api/incidents/history',
  analytics: '/api/analytics',
  alerts: '/api/alerts',
  workflowReplay: (id: string): string => `/api/workflows/${id}/replay`,
} as const;
