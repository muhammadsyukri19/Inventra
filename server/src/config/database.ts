import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma client singleton.
 *
 * Prevents multiple instances during development hot-reloads.
 * Uses globalThis to persist the client across module reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
