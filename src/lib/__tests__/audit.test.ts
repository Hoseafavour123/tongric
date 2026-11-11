import { describe, expect, it, vi } from "vitest";
import { createAuditLogEntry } from "../audit-service";

describe("createAuditLogEntry", () => {
  it("writes a complete audit event via the provided client", async () => {
    const create = vi.fn().mockResolvedValue({ id: "log_1" });

    await createAuditLogEntry(
      { auditLog: { create } },
      {
        actorUserId: "user_1",
        action: "VERIFICATION_APPROVED",
        entityType: "FarmerProfile",
        entityId: "profile_1",
        metadata: { lga: "Gboko" },
        ipAddress: "127.0.0.1",
      },
    );

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: "user_1",
        action: "VERIFICATION_APPROVED",
        entityType: "FarmerProfile",
        entityId: "profile_1",
        metadata: { lga: "Gboko" },
        ipAddress: "127.0.0.1",
      },
    });
  });

  it("defaults optional nullable fields to null", async () => {
    const create = vi.fn().mockResolvedValue({ id: "log_2" });

    await createAuditLogEntry(
      { auditLog: { create } },
      {
        action: "SYSTEM_BOOT",
        entityType: "System",
      },
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: null,
        action: "SYSTEM_BOOT",
        entityType: "System",
        entityId: null,
        ipAddress: null,
      },
    });
  });

  it("rejects blank action or entityType", async () => {
    const create = vi.fn();

    await expect(
      createAuditLogEntry(
        { auditLog: { create } },
        { action: "   ", entityType: "User" },
      ),
    ).rejects.toThrow(/non-empty/);

    expect(create).not.toHaveBeenCalled();
  });
});

