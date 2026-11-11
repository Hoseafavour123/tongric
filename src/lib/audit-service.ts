import type { Prisma } from "@prisma/client";

export interface AuditLogInput {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

export interface AuditLogDelegate {
  auditLog: {
    create(args: {
      data: {
        actorUserId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        metadata?: Prisma.InputJsonValue;
        ipAddress: string | null;
      };
    }): Promise<unknown>;
  };
}

/**
 * Writes an append-only audit entry using either the default DB client
 * or an active Prisma transaction client.
 */
export async function createAuditLogEntry(
  client: AuditLogDelegate,
  input: AuditLogInput,
): Promise<void> {
  const action = input.action.trim();
  const entityType = input.entityType.trim();

  if (!action || !entityType) {
    throw new Error("Audit log entry requires non-empty action and entityType");
  }

  await client.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action,
      entityType,
      entityId: input.entityId ?? null,
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ipAddress: input.ipAddress ?? null,
    },
  });
}

