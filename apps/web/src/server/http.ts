// Response helpers for Next.js Route Handlers.

import { NextResponse } from 'next/server';
import type { ApiError, ApiResponse, ApiSuccess } from '@incidentmind/shared';
import { ServiceError } from './errors';

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = { ok: true, data };
  return NextResponse.json(body, init);
}

export function fail(
  code: string,
  message: string,
  status = 500,
): NextResponse<ApiError> {
  const body: ApiError = { ok: false, error: { code, message } };
  return NextResponse.json(body, { status });
}

/**
 * Wrap a route handler so ServiceError (and any other thrown errors) get
 * mapped onto a clean JSON envelope.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ServiceError) {
        return fail(error.code, error.message, error.status);
      }
      const message =
        error instanceof Error ? error.message : 'Unexpected server error';
      return fail('INTERNAL', message, 500);
    }
  };
}

export function parseJsonBody<T>(value: unknown): T {
  if (typeof value !== 'object' || value === null) {
    throw new ServiceError('BAD_REQUEST', 'Request body must be a JSON object');
  }
  return value as T;
}
