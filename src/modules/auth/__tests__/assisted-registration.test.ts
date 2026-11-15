import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { assistedRegisterFarmerWithRepo } from "../auth-core";
import type {
  ActiveSessionUser,
  AuthRepository,
  CreateRegisteredUserParams,
} from "../auth-repo";

describe("assisted farmer registration", () => {
  const activeLanguages = new Set(["en", "tiv", "ido", "ha"]);

  function createMockAuthRepo() {
    const users: {
      id: string;
      phoneNumber: string;
      email: string | null;
      created: CreateRegisteredUserParams;
    }[] = [];
    const audits: unknown[] = [];

    const repo: AuthRepository = {
      findExistingIdentity: vi.fn(async () => ({ phoneExists: false, emailExists: false })),
      userExistsById: vi.fn(async (id) => id === "admin_100"),
      createRegisteredUser: vi.fn(async (params) => {
        const id = `usr_${users.length + 1}`;
        users.push({
          id,
          phoneNumber: params.phoneNumber,
          email: params.email,
          created: params,
        });
        return {
          id,
          fullName: params.fullName,
          phoneNumber: params.phoneNumber,
          email: params.email,
          role: params.role as "FARMER",
          accountStatus: "ACTIVE" as const,
          preferredLanguageCode: params.preferredLanguageCode,
          createdAt: new Date(),
        };
      }),
      findUserByPhoneForLogin: vi.fn(),
      createSession: vi.fn(),
      findValidSession: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      findActiveRecoveryCodes: vi.fn(),
      consumeRecoveryCodeAndResetPassword: vi.fn(),
      recordSecurityAudit: vi.fn(async (input) => {
        audits.push(input);
      }),
    };

    return { repo, users, audits };
  }

  const adminOperator: ActiveSessionUser = {
    sessionId: "sess_admin",
    user: {
      id: "admin_100",
      fullName: "Makurdi Cooperative Admin",
      phoneNumber: "+2348030000000",
      email: "admin@coop.ng",
      role: "ADMIN",
      accountStatus: "ACTIVE",
      preferredLanguageCode: "en",
      createdAt: new Date(),
    },
  };

  const buyerOperator: ActiveSessionUser = {
    sessionId: "sess_buyer",
    user: {
      id: "buyer_200",
      fullName: "Non Admin Buyer",
      phoneNumber: "+2348032222222",
      email: null,
      role: "BUYER",
      accountStatus: "ACTIVE",
      preferredLanguageCode: "en",
      createdAt: new Date(),
    },
  };

  it("permits ADMIN operator to register a farmer with assistedByUserId and audit trail", async () => {
    const { repo, users, audits } = createMockAuthRepo();

    const res = await assistedRegisterFarmerWithRepo(
      repo,
      adminOperator,
      {
        fullName: "Assisted Rural Farmer",
        phoneNumber: "0803 555 1234",
        email: null,
        password: "secure-rural-pass-1",
        confirmPassword: "secure-rural-pass-1",
        role: "FARMER",
        preferredLanguageCode: "tiv",
        acceptedPrivacyPolicy: true,
      },
      {
        activeLanguageCodes: activeLanguages,
        ipAddress: "197.210.1.1",
      },
    );

    expect(res.user.role).toBe("FARMER");
    expect(res.user.phoneNumber).toBe("+2348035551234");
    expect(res.recoveryCode).toMatch(/^TGR-/);

    expect(users).toHaveLength(1);
    expect(users[0]?.created.assistedByUserId).toBe("admin_100");

    expect(audits).toContainEqual(
      expect.objectContaining({
        action: "ACTOR_ASSISTED_USER_REGISTERED",
        actorUserId: "admin_100",
        entityId: res.user.id,
      }),
    );
  });

  it("blocks non-ADMIN operators from performing assisted registration", async () => {
    const { repo, users } = createMockAuthRepo();

    await expect(
      assistedRegisterFarmerWithRepo(
        repo,
        buyerOperator,
        {
          fullName: "Should Be Blocked",
          phoneNumber: "0803 555 9999",
          password: "password-1234",
          role: "FARMER",
          acceptedPrivacyPolicy: true,
        },
        { activeLanguageCodes: activeLanguages },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(users).toHaveLength(0);
  });
});

