import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createPrismaAuthRepository } from "../auth-prisma-repo";

describe("auth prisma repo phone format resilience", () => {
  it("matches user whether querying with 080... or +234...", async () => {
    let capturedWhere: unknown;
    const mockDb = {
      user: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          capturedWhere = where;
          return Promise.resolve({
            id: "user-reviewer",
            fullName: "Grant Reviewer / Judge",
            phoneNumber: "+2348088888888",
            email: null,
            passwordHash: "mockHash",
            role: "ADMIN",
            accountStatus: "ACTIVE",
            preferredLanguageCode: "en",
          });
        }),
      },
    } as unknown as PrismaClient;

    const repo = createPrismaAuthRepository(mockDb);

    // Call with local format
    const res1 = await repo.findUserByPhoneForLogin("08088888888");
    expect(res1?.id).toBe("user-reviewer");
    expect((capturedWhere as { phoneNumber: { in: string[] } }).phoneNumber.in).toContain("+2348088888888");
    expect((capturedWhere as { phoneNumber: { in: string[] } }).phoneNumber.in).toContain("08088888888");

    // Call with canonical format
    const res2 = await repo.findUserByPhoneForLogin("+2348088888888");
    expect(res2?.id).toBe("user-reviewer");
    expect((capturedWhere as { phoneNumber: { in: string[] } }).phoneNumber.in).toContain("+2348088888888");
    expect((capturedWhere as { phoneNumber: { in: string[] } }).phoneNumber.in).toContain("08088888888");
  });
});

