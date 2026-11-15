import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";
import {
  hashSecret,
  loginUserWithRepo,
  logoutWithRepo,
  recoverPasswordWithRepo,
  validateSessionWithRepo,
  verifySecret,
} from "../index";
import type {
  AuthRepository,
  SessionRecord,
  UserForLogin,
  UserRecoveryCode,
} from "../auth-repo";
import { hashSessionToken } from "../sessions";

describe("login & session service", () => {
  async function createMockAuthRepo() {
    const passwordHash = await hashSecret("secure-farm-pass-2026");
    const recoveryCodeHash = await hashSecret("TGR-ABCDE-FGHKM");

    const users: UserForLogin[] = [
      {
        id: "usr_active",
        fullName: "Tersoo Active",
        phoneNumber: "+2348031112233",
        email: "tersoo@example.com",
        passwordHash,
        role: "FARMER",
        accountStatus: "ACTIVE",
        preferredLanguageCode: "tiv",
      },
      {
        id: "usr_suspended",
        fullName: "Suspended User",
        phoneNumber: "+2348039990000",
        email: null,
        passwordHash,
        role: "BUYER",
        accountStatus: "SUSPENDED",
        preferredLanguageCode: "en",
      },
    ];

    const recoveryCodes: { userId: string; codes: UserRecoveryCode[] }[] = [
      {
        userId: "usr_active",
        codes: [
          {
            id: "rec_1",
            codeHash: recoveryCodeHash,
            isUsed: false,
          },
        ],
      },
    ];

    const sessions: (SessionRecord & { revokedAt: Date | null })[] = [];
    const audits: unknown[] = [];

    const repo: AuthRepository = {
      findExistingIdentity: vi.fn(),
      userExistsById: vi.fn(),
      createRegisteredUser: vi.fn(),

      async findUserByPhoneForLogin(phoneNumber) {
        return users.find((u) => u.phoneNumber === phoneNumber) ?? null;
      },

      async createSession(params) {
        const session: SessionRecord & { revokedAt: Date | null } = {
          id: `sess_${sessions.length + 1}`,
          userId: params.userId,
          sessionHash: params.sessionHash,
          expiresAt: params.expiresAt,
          createdAt: new Date(),
          revokedAt: null,
        };
        sessions.push(session);
        return session;
      },

      async findValidSession(sessionHash) {
        const sess = sessions.find(
          (s) =>
            s.sessionHash === sessionHash &&
            s.revokedAt === null &&
            s.expiresAt > new Date(),
        );
        if (!sess) return null;
        const user = users.find((u) => u.id === sess.userId);
        if (!user) return null;
        return {
          sessionId: sess.id,
          user: {
            id: user.id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            preferredLanguageCode: user.preferredLanguageCode,
            createdAt: new Date(),
          },
        };
      },

      async revokeSession(sessionHash) {
        const sess = sessions.find((s) => s.sessionHash === sessionHash);
        if (sess && !sess.revokedAt) {
          sess.revokedAt = new Date();
          return true;
        }
        return false;
      },

      async revokeAllUserSessions(userId) {
        let count = 0;
        for (const s of sessions) {
          if (s.userId === userId && !s.revokedAt) {
            s.revokedAt = new Date();
            count++;
          }
        }
        return count;
      },

      async findActiveRecoveryCodes(phoneNumber) {
        const user = users.find((u) => u.phoneNumber === phoneNumber);
        if (!user) return null;
        const entry = recoveryCodes.find((r) => r.userId === user.id);
        return entry ? { userId: entry.userId, codes: entry.codes.filter((c) => !c.isUsed) } : null;
      },

      async consumeRecoveryCodeAndResetPassword(params) {
        const entry = recoveryCodes.find((r) => r.userId === params.userId);
        const code = entry?.codes.find((c) => c.id === params.recoveryCodeId);
        if (code) {
          code.isUsed = true;
        }
        const user = users.find((u) => u.id === params.userId);
        if (user) {
          user.passwordHash = params.newPasswordHash;
        }
        for (const s of sessions) {
          if (s.userId === params.userId) {
            s.revokedAt = new Date();
          }
        }
      },

      async recordSecurityAudit(input) {
        audits.push(input);
      },
    };

    return { repo, users, recoveryCodes, sessions, audits };
  }

  it("authenticates valid credentials, normalizes phone, creates session, and records audit", async () => {
    const { repo, sessions, audits } = await createMockAuthRepo();

    const res = await loginUserWithRepo(
      repo,
      {
        phoneNumber: "0803 111 2233",
        password: "secure-farm-pass-2026",
      },
      { ipAddress: "127.0.0.1" },
    );

    expect(res.user.fullName).toBe("Tersoo Active");
    expect(res.user.phoneNumber).toBe("+2348031112233");
    expect(res.token).toHaveLength(64);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.sessionHash).toBe(hashSessionToken(res.token));
    expect(audits).toContainEqual(
      expect.objectContaining({ action: "LOGIN_SUCCESS" }),
    );
  });

  it("rejects non-existent phone with uniform message and logs failed attempt", async () => {
    const { repo, audits } = await createMockAuthRepo();

    await expect(
      loginUserWithRepo(repo, {
        phoneNumber: "0803 999 9999",
        password: "any-password",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(audits).toContainEqual(
      expect.objectContaining({
        action: "LOGIN_FAILED",
        metadata: expect.objectContaining({ reason: "USER_NOT_FOUND" }),
      }),
    );
  });

  it("rejects incorrect password with uniform message and logs failed attempt", async () => {
    const { repo, audits } = await createMockAuthRepo();

    await expect(
      loginUserWithRepo(repo, {
        phoneNumber: "0803 111 2233",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(audits).toContainEqual(
      expect.objectContaining({
        action: "LOGIN_FAILED",
        metadata: expect.objectContaining({ reason: "INVALID_CREDENTIALS" }),
      }),
    );
  });

  it("blocks login for suspended accounts", async () => {
    const { repo } = await createMockAuthRepo();

    await expect(
      loginUserWithRepo(repo, {
        phoneNumber: "0803 999 0000",
        password: "secure-farm-pass-2026",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("validates session tokens and logs out cleanly", async () => {
    const { repo } = await createMockAuthRepo();

    const loginRes = await loginUserWithRepo(repo, {
      phoneNumber: "0803 111 2233",
      password: "secure-farm-pass-2026",
    });

    const activeSession = await validateSessionWithRepo(repo, loginRes.token);
    expect(activeSession?.user.fullName).toBe("Tersoo Active");

    const loggedOut = await logoutWithRepo(repo, loginRes.token);
    expect(loggedOut).toBe(true);

    const afterLogout = await validateSessionWithRepo(repo, loginRes.token);
    expect(afterLogout).toBeNull();
  });

  it("resets password with valid recovery code, consumes the code, and invalidates sessions", async () => {
    const { repo, users, recoveryCodes, sessions } = await createMockAuthRepo();

    // Create an active session
    await loginUserWithRepo(repo, {
      phoneNumber: "0803 111 2233",
      password: "secure-farm-pass-2026",
    });
    expect(sessions[0]?.revokedAt).toBeNull();

    // Reset password with recovery code
    const resetRes = await recoverPasswordWithRepo(repo, {
      phoneNumber: "0803 111 2233",
      recoveryCode: "tgr-abcde-fghkm",
      newPassword: "new-harvest-pass-2027",
      confirmNewPassword: "new-harvest-pass-2027",
    });

    expect(resetRes.success).toBe(true);

    // Code must now be marked isUsed
    expect(recoveryCodes[0]?.codes[0]?.isUsed).toBe(true);

    // Old session must be revoked
    expect(sessions[0]?.revokedAt).not.toBeNull();

    // Old password must fail; new password must succeed
    const user = users.find((u) => u.id === "usr_active");
    await expect(
      verifySecret("secure-farm-pass-2026", user!.passwordHash),
    ).resolves.toBe(false);
    await expect(
      verifySecret("new-harvest-pass-2027", user!.passwordHash),
    ).resolves.toBe(true);

    // Attempting to reuse the consumed recovery code must fail
    await expect(
      recoverPasswordWithRepo(repo, {
        phoneNumber: "0803 111 2233",
        recoveryCode: "tgr-abcde-fghkm",
        newPassword: "another-password-2028",
        confirmNewPassword: "another-password-2028",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

