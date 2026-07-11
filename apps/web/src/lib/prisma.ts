// Centralized Prisma client.
//
// Import this from server-side code (route handlers, server components)
// to avoid creating a new connection on every hot reload during dev.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __incidentmindPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__incidentmindPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__incidentmindPrisma = prisma;
}
