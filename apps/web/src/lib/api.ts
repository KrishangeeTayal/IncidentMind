// Typed API client used by server components to call our own route
// handlers. We never call Prisma directly from the UI — everything
// goes through the API envelope so the contract stays visible.

import type { ApiResponse } from '@incidentmind/shared';

const DEFAULT_BASE_URL = 'http://localhost:3000';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_BASE_URL;
}

class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
    // Server components should never cache, otherwise the dashboard
    // becomes stale as soon as a new alert comes in.
    cache: 'no-store',
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'BAD_RESPONSE',
      `API ${path} returned a non-JSON response (status ${res.status})`,
      res.status,
    );
  }

  if (!res.ok || !body) {
    throw new ApiError(
      'HTTP_ERROR',
      `API ${path} failed with status ${res.status}`,
      res.status,
    );
  }

  if (!body.ok) {
    throw new ApiError(body.error.code, body.error.message, res.status);
  }

  return body.data;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export { ApiError };
