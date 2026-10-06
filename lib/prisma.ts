// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configuration Prisma optimisée pour Neon
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// WRAPPER AVEC RETRY AUTOMATIQUE
// ============================================
const RETRYABLE_ERRORS = [
  'reach database server',
  'Connection reset',
  'Connection closed',
  'Server has closed the connection',
  'Timed out fetching a new connection',
  'ECONNRESET',
  'ETIMEDOUT',
];

function isRetryableError(error: any): boolean {
  const message = error?.message || '';
  return RETRYABLE_ERRORS.some((e) => message.includes(e));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (isRetryableError(error) && attempt < maxAttempts) {
        console.log(`⏳ Retry ${attempt}/${maxAttempts} après erreur: ${error.message.substring(0, 50)}...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// Client Prisma avec retry
export const prismaWithRetry = new Proxy(prisma, {
  get(target, prop) {
    const original = target[prop as keyof PrismaClient];

    if (typeof original === 'object' && original !== null) {
      // Proxy pour les modèles (user, tontine, etc.)
      return new Proxy(original, {
        get(modelTarget, modelProp) {
          const method = modelTarget[modelProp as keyof typeof modelTarget];

          if (typeof method === 'function') {
            return (...args: any[]) => {
              return withRetry(() => (method as Function).apply(modelTarget, args));
            };
          }

          return method;
        },
      });
    }

    if (typeof original === 'function') {
      return (...args: any[]) => {
        return withRetry(() => (original as Function).apply(target, args));
      };
    }

    return original;
  },
});

export default prisma;