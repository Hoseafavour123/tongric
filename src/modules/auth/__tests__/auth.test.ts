import { describe, expect, it, vi } from "vitest";
import { ConflictError, ForbiddenError } from "@/lib/errors";
import {
  formatNigerianPhoneLocal,
  generateRecoveryCode,
  hashSecret,
  normalizeNigerianPhone,
  normalizeRecoveryCode,
  PUBLIC_REGISTRATION_ROLES,
  registerInputSchema,
  registerUserWithRepo,
  verifySecret,
} from "../index";
import type { AuthRepository, CreateRegisteredUserParams } from "../auth-repo";

describe("Nigerian phone normalization", () => {
  it("normalizes common local and international Nigerian GSM formats to +234 E.164", () => {
    expect(normalizeNigerianPhone("08031234567")).toBe("+2348031234567");
    expect(normalizeNigerianPhone("2348031234567")).toBe("+2348031234567");
    expect(normalizeNigerianPhone("+234 803 123 4567")).toBe("+2348031234567");
    expect(normalizeNigerianPhone("+234 (0803) 123-4567")).toBe("+2348031234567");
    expect(normalizeNigerianPhone("09151234567")).toBe("+2349151234567");
    expect(formatNigerianPhoneLocal("+2348031234567")).toBe("0803 123 4567");
  });

  it("rejects non-Nigerian or malformed phone numbers", () => {
    expect(normalizeNigerianPhone("")).toBeNull();
    expect(normalizeNigerianPhone("+14155552671")).toBeNull();
    expect(normalizeNigerianPhone("05012345678")).toBeNull();
    expect(normalizeNigerianPhone("0803123")).toBeNull();
    expect(normalizeNigerianPhone("0803abcdefg")).toBeNull();
  });
});

describe("crypto & offline recovery code helpers", () => {
  it("hashes and verifies secrets with per-record random salts", async () => {
    const hashA = await hashSecret("benue-yam-2026");
    const hashB = await hashSecret("benue-yam-2026");

    expect(hashA).not.toBe(hashB);
    expect(hashA.startsWith("scrypt$")).toBe(true);
    await expect(verifySecret("benue-yam-2026", hashA)).resolves.toBe(true);
    await expect(verifySecret("wrong-password", hashA)).resolves.toBe(false);
    await expect(verifySecret("anything", "malformed-hash")).resolves.toBe(false);
  });

  it("generates unambiguous recovery codes and normalizes user input formats", () => {
    const code = generateRecoveryCode();
    expect(code).toMatch(/^TGR-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/);

    const lowered = code.toLowerCase().replace(/-/g, " ");
    expect(normalizeRecoveryCode(lowered)).toBe(code);
    expect(normalizeRecoveryCode(code.slice(4).toLowerCase())).toBe(code);
    expect(normalizeRecoveryCode("invalid-0O1IL-code")).toBeNull();
  });
});

describe("registration schema & domain service", () => {
  const activeLanguages = new Set(["en", "tiv", "ido", "ha"]);

  function createInMemoryAuthRepo() {
    const users: {
      id: string;
      phoneNumber: string;
      email: string | null;
      created: CreateRegisteredUserParams;
    }[] = [];
    const securityAudits: unknown[] = [];

    const repo: AuthRepository = {
      async findExistingIdentity({ phoneNumber, email }) {
        return {
          phoneExists: users.some((u) => u.phoneNumber === phoneNumber),
          emailExists:
            email !== null && users.some((u) => u.email === email),
        };
      },
      async userExistsById(userId) {
        return users.some((u) => u.id === userId);
      },
      async createRegisteredUser(params) {
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
          role: params.role,
          accountStatus: "ACTIVE",
          preferredLanguageCode: params.preferredLanguageCode,
          createdAt: new Date("2026-11-11T12:00:00.000Z"),
        };
      },
      async recordSecurityAudit(input) {
        securityAudits.push(input);
      },
      findUserByPhoneForLogin: vi.fn(),
      createSession: vi.fn(),
      findValidSession: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllUserSessions: vi.fn(),
      findActiveRecoveryCodes: vi.fn(),
      consumeRecoveryCodeAndResetPassword: vi.fn(),
    };

    return { repo, users, securityAudits };
  }

  it("exposes only Farmer, Buyer, and Transport Provider as public roles", () => {
    expect(PUBLIC_REGISTRATION_ROLES).toEqual([
      "FARMER",
      "BUYER",
      "TRANSPORT_PROVIDER",
    ]);
  });

  it("rejects weak passwords, password mismatches, and missing NDPA consent", () => {
    const res = registerInputSchema.safeParse({
      fullName: "Terfa Agber",
      phoneNumber: "08031234567",
      email: "",
      password: "12345678",
      confirmPassword: "different",
      role: "FARMER",
      acceptedPrivacyPolicy: false,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("password");
      expect(paths).toContain("confirmPassword");
      expect(paths).toContain("acceptedPrivacyPolicy");
    }
  });

  it("creates user, hashed password & recovery code, unbundled NDPA consents, and language sync", async () => {
    const { repo, users } = createInMemoryAuthRepo();

    const result = await registerUserWithRepo(
      repo,
      {
        fullName: "  Aondona   Tersoo ",
        phoneNumber: "0803 123 4567",
        email: "   ",
        password: "benue-harvest-99",
        confirmPassword: "benue-harvest-99",
        role: "FARMER",
        preferredLanguageCode: null,
        acceptedPrivacyPolicy: true,
        acceptedOptionalUpdates: false,
      },
      {
        activeLanguageCodes: activeLanguages,
        cookieLocale: "tiv",
        ipAddress: "127.0.0.1",
        userAgent: "Vitest",
      },
    );

    expect(result.user.fullName).toBe("Aondona Tersoo");
    expect(result.user.phoneNumber).toBe("+2348031234567");
    expect(result.user.email).toBeNull();
    expect(result.user.role).toBe("FARMER");
    expect(result.user.preferredLanguageCode).toBe("tiv");
    expect(result.consentPolicyVersion).toBe("2026-11-v1");
    expect(result.recoveryCode).toMatch(/^TGR-/);

    const saved = users[0]?.created;
    expect(saved).toBeDefined();
    expect(saved?.passwordHash).not.toContain("benue-harvest-99");
    expect(saved?.recoveryCodeHash).not.toBe(result.recoveryCode);
    await expect(
      verifySecret(result.recoveryCode, saved!.recoveryCodeHash),
    ).resolves.toBe(true);
    await expect(
      verifySecret("benue-harvest-99", saved!.passwordHash),
    ).resolves.toBe(true);

    expect(saved?.consents).toHaveLength(2);
    expect(saved?.consents[0]).toMatchObject({
      consentType: "TERMS_AND_PRIVACY",
      granted: true,
      policyVersion: "2026-11-v1",
      locale: "tiv",
    });
    expect(saved?.consents[1]).toMatchObject({
      consentType: "OPTIONAL_UPDATES",
      granted: false,
    });
  });

  it("allows multiple emailless farmers while rejecting duplicate normalized phones or emails", async () => {
    const { repo } = createInMemoryAuthRepo();

    await registerUserWithRepo(
      repo,
      {
        fullName: "Farmer One",
        phoneNumber: "+2348031234567",
        email: "",
        password: "strong-password-1",
        role: "FARMER",
        acceptedPrivacyPolicy: true,
        acceptedOptionalUpdates: false,
      },
      { activeLanguageCodes: activeLanguages },
    );

    // Second farmer without email but different phone must succeed cleanly.
    const second = await registerUserWithRepo(
      repo,
      {
        fullName: "Farmer Two",
        phoneNumber: "08091234567",
        email: null,
        password: "strong-password-2",
        role: "BUYER",
        acceptedPrivacyPolicy: true,
        acceptedOptionalUpdates: true,
      },
      { activeLanguageCodes: activeLanguages },
    );
    expect(second.user.email).toBeNull();

    // Same phone entered in local 0803 format must collide cleanly.
    await expect(
      registerUserWithRepo(
        repo,
        {
          fullName: "Duplicate Phone",
          phoneNumber: "08031234567",
          email: "",
          password: "strong-password-3",
          role: "FARMER",
          acceptedPrivacyPolicy: true,
          acceptedOptionalUpdates: false,
        },
        { activeLanguageCodes: activeLanguages },
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks public ADMIN signup and records a security audit event", async () => {
    const { repo, users, securityAudits } = createInMemoryAuthRepo();
    const auditSpy = vi.spyOn(repo, "recordSecurityAudit");

    await expect(
      registerUserWithRepo(
        repo,
        {
          fullName: "Malicious Admin",
          phoneNumber: "08031234567",
          email: "admin@example.com",
          password: "strong-password-1",
          role: "ADMIN",
          acceptedPrivacyPolicy: true,
          acceptedOptionalUpdates: false,
        },
        { activeLanguageCodes: activeLanguages, ipAddress: "10.0.0.5" },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(users).toHaveLength(0);
    expect(auditSpy).toHaveBeenCalledTimes(1);
    expect(securityAudits[0]).toMatchObject({
      action: "ADMIN_SELF_REGISTRATION_BLOCKED",
      entityType: "User",
      ipAddress: "10.0.0.5",
    });
  });

  it("records assistedByUserId only when provided via trusted server context and falls back invalid language codes", async () => {
    const { repo, users } = createInMemoryAuthRepo();

    const helper = await registerUserWithRepo(
      repo,
      {
        fullName: "Helper Account",
        phoneNumber: "08030000001",
        password: "strong-password-1",
        role: "BUYER",
        acceptedPrivacyPolicy: true,
        acceptedOptionalUpdates: false,
      },
      { activeLanguageCodes: activeLanguages },
    );

    const assisted = await registerUserWithRepo(
      repo,
      {
        fullName: "Assisted Farmer",
        phoneNumber: "08030000002",
        password: "strong-password-2",
        role: "FARMER",
        preferredLanguageCode: "unknown_lang",
        acceptedPrivacyPolicy: true,
        acceptedOptionalUpdates: false,
      },
      {
        activeLanguageCodes: activeLanguages,
        cookieLocale: "ido",
        assistedByUserId: helper.user.id,
      },
    );

    expect(assisted.user.preferredLanguageCode).toBe("ido");
    expect(users[1]?.created.assistedByUserId).toBe(helper.user.id);
  });
});

