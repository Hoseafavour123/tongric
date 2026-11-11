import "server-only";
import { PrismaClient } from "@prisma/client";
import { getEnv } from "./env";
import { ServiceUnavailableError } from "./errors";

declare global {
  var __tongricPrisma: PrismaClient | undefined;
}

/**
 * Returns the memoized PrismaClient singleton.
 * Throws ServiceUnavailableError if DATABASE_URL has not been configured yet.
 */
export function getDb(): PrismaClient {
  const { DATABASE_URL, NODE_ENV } = getEnv();

  if (!DATABASE_URL) {
    throw new ServiceUnavailableError("Database connection unavailable");
  }

  if (!globalThis.__tongricPrisma) {
    globalThis.__tongricPrisma = new PrismaClient({
      log: NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return globalThis.__tongricPrisma;
}

