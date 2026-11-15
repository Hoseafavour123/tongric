import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { DEFAULT_LOCALE } from "@/modules/i18n/base-dictionary";
import type { ActiveSessionUser, AuthRepository } from "./auth-repo";
import {
  generateRecoveryCode,
  hashSecret,
  normalizeRecoveryCode,
  verifySecret,
} from "./crypto";
import { normalizeNigerianPhone } from "./phone";
import {
  NDPA_PRIVACY_POLICY_VERSION,
  loginInputSchema,
  normalizeEmailInput,
  recoverInputSchema,
  registerInputSchema,
  type AuthAccountStatus,
  type AuthUserRole,
  type PublicRegistrationRole,
  type RawLoginInput,
  type RawRecoverInput,
  type RawRegisterInput,
} from "./schemas";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_TTL_MS,
} from "./sessions";

export interface RegisterRequestContext {
  activeLanguageCodes: ReadonlySet<string>;
  cookieLocale?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  /**
   * Trusted server-only operator ID populated exclusively by verified Admin assisted-onboarding
   * workflows (Feature 3.3). Never derived from unauthenticated public request payloads.
   */
  assistedByUserId?: string | null;
}

export interface RegistrationResult {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    role: AuthUserRole;
    accountStatus: AuthAccountStatus;
    preferredLanguageCode: string;
    createdAt: string;
  };
  recoveryCode: string;
  consentPolicyVersion: string;
}

function resolvePreferredLanguage(
  requestedLocale: string | null | undefined,
  cookieLocale: string | null | undefined,
  activeLanguageCodes: ReadonlySet<string>,
): string {
  const cleanRequested = requestedLocale?.trim().toLowerCase();
  if (cleanRequested && activeLanguageCodes.has(cleanRequested)) {
    return cleanRequested;
  }

  const cleanCookie = cookieLocale?.trim().toLowerCase();
  if (cleanCookie && activeLanguageCodes.has(cleanCookie)) {
    return cleanCookie;
  }

  return DEFAULT_LOCALE;
}

/**
 * Pure registration domain orchestrator decoupled from Next runtime APIs for direct Vitest coverage.
 */
export async function registerUserWithRepo(
  repo: AuthRepository,
  rawInput: RawRegisterInput,
  context: RegisterRequestContext,
): Promise<RegistrationResult> {
  const parsed = registerInputSchema.parse(rawInput);
  const normalizedRole = parsed.role.toUpperCase();
  const ipAddress = context.ipAddress ?? null;

  if (normalizedRole === "ADMIN") {
    try {
      await repo.recordSecurityAudit({
        actorUserId: context.assistedByUserId ?? null,
        action: "ADMIN_SELF_REGISTRATION_BLOCKED",
        entityType: "User",
        metadata: {
          attemptedRole: "ADMIN",
          phoneNormalized: normalizeNigerianPhone(parsed.phoneNumber) ?? "invalid",
        },
        ipAddress,
      });
    } catch (auditError) {
      console.warn("[Tongric Auth] Failed to audit blocked admin signup:", auditError);
    }
    throw new ForbiddenError(
      "Administrator accounts cannot be created through public registration.",
    );
  }

  const phoneNumber = normalizeNigerianPhone(parsed.phoneNumber);
  if (!phoneNumber) {
    throw new ValidationError("Enter a valid Nigerian phone number");
  }

  const email = normalizeEmailInput(parsed.email);
  const existing = await repo.findExistingIdentity({ phoneNumber, email });

  if (existing.phoneExists) {
    throw new ConflictError(
      "An account with this Nigerian phone number already exists.",
    );
  }

  if (existing.emailExists) {
    throw new ConflictError(
      "An account with this email address already exists.",
    );
  }

  let verifiedAssistedByUserId: string | null = null;
  if (context.assistedByUserId) {
    const helperExists = await repo.userExistsById(context.assistedByUserId);
    if (!helperExists) {
      throw new ValidationError("Assisting operator account was not found");
    }
    verifiedAssistedByUserId = context.assistedByUserId;
  }

  const preferredLanguageCode = resolvePreferredLanguage(
    parsed.preferredLanguageCode,
    context.cookieLocale,
    context.activeLanguageCodes,
  );

  const recoveryCode = generateRecoveryCode();
  const canonicalRecoveryCode = normalizeRecoveryCode(recoveryCode) ?? recoveryCode;

  const [passwordHash, recoveryCodeHash] = await Promise.all([
    hashSecret(parsed.password),
    hashSecret(canonicalRecoveryCode),
  ]);

  const createdUser = await repo.createRegisteredUser({
    fullName: parsed.fullName,
    phoneNumber,
    email,
    passwordHash,
    role: normalizedRole as PublicRegistrationRole,
    preferredLanguageCode,
    assistedByUserId: verifiedAssistedByUserId,
    recoveryCodeHash,
    consents: [
      {
        consentType: "TERMS_AND_PRIVACY",
        policyVersion: NDPA_PRIVACY_POLICY_VERSION,
        granted: true,
        locale: preferredLanguageCode,
        ipAddress,
        userAgent: context.userAgent ?? null,
      },
      {
        consentType: "OPTIONAL_UPDATES",
        policyVersion: NDPA_PRIVACY_POLICY_VERSION,
        granted: Boolean(parsed.acceptedOptionalUpdates),
        locale: preferredLanguageCode,
        ipAddress,
        userAgent: context.userAgent ?? null,
      },
    ],
    audit: {
      ipAddress,
    },
  });

  return {
    user: {
      id: createdUser.id,
      fullName: createdUser.fullName,
      phoneNumber: createdUser.phoneNumber,
      email: createdUser.email,
      role: createdUser.role,
      accountStatus: createdUser.accountStatus,
      preferredLanguageCode: createdUser.preferredLanguageCode,
      createdAt: createdUser.createdAt.toISOString(),
    },
    recoveryCode,
    consentPolicyVersion: NDPA_PRIVACY_POLICY_VERSION,
  };
}

export interface LoginResult {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    role: AuthUserRole;
    accountStatus: AuthAccountStatus;
    preferredLanguageCode: string;
  };
}

export async function loginUserWithRepo(
  repo: AuthRepository,
  rawInput: RawLoginInput,
  context: { ipAddress?: string | null; userAgent?: string | null } = {},
): Promise<LoginResult> {
  const parsed = loginInputSchema.parse(rawInput);
  const phoneNumber = normalizeNigerianPhone(parsed.phoneNumber);
  if (!phoneNumber) {
    throw new ValidationError("Enter a valid Nigerian phone number");
  }

  const user = await repo.findUserByPhoneForLogin(phoneNumber);
  if (!user) {
    try {
      await repo.recordSecurityAudit({
        actorUserId: null,
        action: "LOGIN_FAILED",
        entityType: "User",
        metadata: { reason: "USER_NOT_FOUND", phone: phoneNumber },
        ipAddress: context.ipAddress ?? null,
      });
    } catch {}
    throw new UnauthorizedError("Invalid phone number or password.");
  }

  if (user.accountStatus !== "ACTIVE") {
    throw new ForbiddenError(
      "Your account is not active. Please contact Tongric support.",
    );
  }

  const isValid = await verifySecret(parsed.password, user.passwordHash);
  if (!isValid) {
    try {
      await repo.recordSecurityAudit({
        actorUserId: user.id,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
        metadata: { reason: "INVALID_CREDENTIALS" },
        ipAddress: context.ipAddress ?? null,
      });
    } catch {}
    throw new UnauthorizedError("Invalid phone number or password.");
  }

  const token = generateSessionToken();
  const sessionHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await repo.createSession({
    userId: user.id,
    sessionHash,
    expiresAt,
    ipAddress: context.ipAddress ?? null,
    userAgent: context.userAgent ?? null,
  });

  try {
    await repo.recordSecurityAudit({
      actorUserId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: context.ipAddress ?? null,
    });
  } catch {}

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      preferredLanguageCode: user.preferredLanguageCode,
    },
  };
}

export async function validateSessionWithRepo(
  repo: AuthRepository,
  token: string,
): Promise<ActiveSessionUser | null> {
  if (!token || typeof token !== "string" || token.length !== 64) {
    return null;
  }
  const sessionHash = hashSessionToken(token);
  return repo.findValidSession(sessionHash);
}

export async function logoutWithRepo(
  repo: AuthRepository,
  token: string,
): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }
  const sessionHash = hashSessionToken(token);
  return repo.revokeSession(sessionHash);
}

export async function recoverPasswordWithRepo(
  repo: AuthRepository,
  rawInput: RawRecoverInput,
  context: { ipAddress?: string | null } = {},
): Promise<{ success: true; message: string }> {
  const parsed = recoverInputSchema.parse(rawInput);
  const phoneNumber = normalizeNigerianPhone(parsed.phoneNumber);
  if (!phoneNumber) {
    throw new ValidationError("Enter a valid Nigerian phone number");
  }

  const normalizedCode = normalizeRecoveryCode(parsed.recoveryCode);
  if (!normalizedCode) {
    throw new ValidationError(
      "Invalid recovery code format. Code should be TGR-XXXXX-XXXXX.",
    );
  }

  const record = await repo.findActiveRecoveryCodes(phoneNumber);
  if (!record || record.codes.length === 0) {
    throw new ValidationError(
      "Invalid recovery code or no active recovery codes for this account.",
    );
  }

  let matchingCodeId: string | null = null;
  for (const codeItem of record.codes) {
    const isMatch = await verifySecret(normalizedCode, codeItem.codeHash);
    if (isMatch) {
      matchingCodeId = codeItem.id;
      break;
    }
  }

  if (!matchingCodeId) {
    try {
      await repo.recordSecurityAudit({
        actorUserId: record.userId,
        action: "PASSWORD_RESET_FAILED",
        entityType: "User",
        entityId: record.userId,
        metadata: { reason: "RECOVERY_CODE_MISMATCH" },
        ipAddress: context.ipAddress ?? null,
      });
    } catch {}
    throw new ValidationError(
      "Invalid recovery code. Please check the code written in your notebook.",
    );
  }

  const newPasswordHash = await hashSecret(parsed.newPassword);

  await repo.consumeRecoveryCodeAndResetPassword({
    userId: record.userId,
    recoveryCodeId: matchingCodeId,
    newPasswordHash,
    ipAddress: context.ipAddress ?? null,
  });

  return {
    success: true,
    message: "Password reset successful. Please log in with your new password.",
  };
}

export async function assistedRegisterFarmerWithRepo(
  repo: AuthRepository,
  operatorUser: ActiveSessionUser,
  rawInput: RawRegisterInput,
  context: Omit<RegisterRequestContext, "assistedByUserId">,
): Promise<RegistrationResult> {
  if (operatorUser.user.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only platform administrators or authorized operators can perform assisted farmer registration.",
    );
  }

  const result = await registerUserWithRepo(repo, rawInput, {
    ...context,
    assistedByUserId: operatorUser.user.id,
  });

  try {
    await repo.recordSecurityAudit({
      actorUserId: operatorUser.user.id,
      action: "ACTOR_ASSISTED_USER_REGISTERED",
      entityType: "User",
      entityId: result.user.id,
      metadata: {
        operatorUserId: operatorUser.user.id,
        beneficiaryUserId: result.user.id,
        beneficiaryPhone: result.user.phoneNumber,
        beneficiaryRole: result.user.role,
      },
      ipAddress: context.ipAddress ?? null,
    });
  } catch (auditError) {
    console.warn(
      "[Tongric Auth] Failed to record assisted onboarding audit:",
      auditError,
    );
  }

  return result;
}

