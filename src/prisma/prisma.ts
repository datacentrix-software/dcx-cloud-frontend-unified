/**
 * Prisma Client Configuration for DCX Cloud Wallet System
 * Real Prisma client for wallet database operations
 */

import { PrismaClient } from '../generated/client';

// Create a singleton instance of Prisma Client
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      // Configure for production use
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.POSTGRES_URL
        }
      }
    });
  }
  return prismaInstance;
}

// Export the singleton instance
export const prisma = getPrismaClient();

// Application-specific Prisma client (for multi-database setup)
export const prismaApplication = prisma;

// Cleanup function for testing
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}