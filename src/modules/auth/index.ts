export const MODULE_NAME = "auth" as const;

export {
  formatNigerianPhoneLocal,
  isValidNigerianPhone,
  normalizeNigerianPhone,
} from "./phone";

export {
  generateRecoveryCode,
  hashSecret,
  normalizeRecoveryCode,
  verifySecret,
} from "./crypto";

export {
  ACCOUNT_STATUSES,
  ALL_USER_ROLES,
  CONSENT_TYPES,
  isWeakPassword,
  loginInputSchema,
  NDPA_PRIVACY_POLICY_VERSION,
  normalizeEmailInput,
  PUBLIC_REGISTRATION_ROLES,
  recoverInputSchema,
  registerInputSchema,
  type AuthAccountStatus,
  type AuthConsentType,
  type AuthUserRole,
  type ParsedLoginInput,
  type ParsedRecoverInput,
  type ParsedRegisterInput,
  type PublicRegistrationRole,
  type RawLoginInput,
  type RawRecoverInput,
  type RawRegisterInput,
} from "./schemas";

export {
  buildClearSessionCookieOptions,
  buildSessionCookieOptions,
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  SESSION_TTL_MS,
} from "./sessions";

export {
  assistedRegisterFarmerWithRepo,
  loginUserWithRepo,
  logoutWithRepo,
  recoverPasswordWithRepo,
  registerUserWithRepo,
  validateSessionWithRepo,
  type LoginResult,
  type RegisterRequestContext,
  type RegistrationResult,
} from "./auth-core";

export type {
  ActiveSessionUser,
  AuthRepository,
  CreateRegisteredUserParams,
  SessionRecord,
  UserForLogin,
} from "./auth-repo";
