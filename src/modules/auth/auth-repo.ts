import type {
  AuthAccountStatus,
  AuthConsentType,
  AuthUserRole,
  PublicRegistrationRole,
} from "./schemas";

export interface ExistingIdentityMatch {
  phoneExists: boolean;
  emailExists: boolean;
}

export interface CreateRegisteredUserParams {
  fullName: string;
  phoneNumber: string;
  email: string | null;
  passwordHash: string;
  role: PublicRegistrationRole;
  preferredLanguageCode: string;
  assistedByUserId: string | null;
  recoveryCodeHash: string;
  consents: readonly {
    consentType: AuthConsentType;
    policyVersion: string;
    granted: boolean;
    locale: string;
    ipAddress: string | null;
    userAgent: string | null;
  }[];
  audit: {
    ipAddress: string | null;
  };
}

export interface RegisteredUserSummary {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: AuthUserRole;
  accountStatus: AuthAccountStatus;
  preferredLanguageCode: string;
  createdAt: Date;
}

export interface UserForLogin {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  passwordHash: string;
  role: AuthUserRole;
  accountStatus: AuthAccountStatus;
  preferredLanguageCode: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  sessionHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ActiveSessionUser {
  sessionId: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string | null;
    role: AuthUserRole;
    accountStatus: AuthAccountStatus;
    preferredLanguageCode: string;
    createdAt: Date;
  };
}

export interface UserRecoveryCode {
  id: string;
  codeHash: string;
  isUsed: boolean;
}

export interface AuthRepository {
  findExistingIdentity(input: {
    phoneNumber: string;
    email: string | null;
  }): Promise<ExistingIdentityMatch>;
  userExistsById(userId: string): Promise<boolean>;
  createRegisteredUser(
    params: CreateRegisteredUserParams,
  ): Promise<RegisteredUserSummary>;
  findUserByPhoneForLogin(phoneNumber: string): Promise<UserForLogin | null>;
  createSession(params: {
    userId: string;
    sessionHash: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<SessionRecord>;
  findValidSession(sessionHash: string): Promise<ActiveSessionUser | null>;
  revokeSession(sessionHash: string): Promise<boolean>;
  revokeAllUserSessions(userId: string): Promise<number>;
  findActiveRecoveryCodes(
    phoneNumber: string,
  ): Promise<{ userId: string; codes: UserRecoveryCode[] } | null>;
  consumeRecoveryCodeAndResetPassword(params: {
    userId: string;
    recoveryCodeId: string;
    newPasswordHash: string;
    ipAddress: string | null;
  }): Promise<void>;
  recordSecurityAudit(input: {
    actorUserId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, string | number | boolean | null>;
    ipAddress?: string | null;
  }): Promise<void>;
}

