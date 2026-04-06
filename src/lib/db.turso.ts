/**
 * Turso database connection for production deployment.
 *
 * To deploy with Turso:
 * 1. Copy this file to db.ts (replacing the SQLite version)
 * 2. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars
 * 3. Deploy to Vercel
 */
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
