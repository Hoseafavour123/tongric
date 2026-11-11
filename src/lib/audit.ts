import "server-only";
import type { Prisma } from "@prisma/client";
import { createAuditLogEntry, type AuditLogInput } from "./audit-service";
import { getDb } from "./db";

/**
 * Records an append-only audit event inside the active transaction client (if supplied)
 * or using the shared Prisma database client.
 */
export async function recordAuditLog(
  input: AuditLogInput,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? getDb();
  await createAuditLogEntry(client, input);
}

