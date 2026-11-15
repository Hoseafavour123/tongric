import "server-only";
import { getDb } from "@/lib/db";
import { getActiveLanguages } from "@/modules/i18n/i18n.service";
import {
  assistedRegisterFarmerWithRepo,
  loginUserWithRepo,
  logoutWithRepo,
  recoverPasswordWithRepo,
  registerUserWithRepo,
  validateSessionWithRepo,
  type LoginResult,
  type RegistrationResult,
} from "./auth-core";
import { createPrismaAuthRepository } from "./auth-prisma-repo";
import type { ActiveSessionUser } from "./auth-repo";
import type {
  RawLoginInput,
  RawRecoverInput,
  RawRegisterInput,
} from "./schemas";

export interface RegisterUserOptions {
  cookieLocale?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  assistedByUserId?: string | null;
}

export async function registerUser(
  rawInput: RawRegisterInput,
  options: RegisterUserOptions = {},
): Promise<RegistrationResult> {
  const [db, activeLanguages] = [getDb(), await getActiveLanguages()];
  const activeLanguageCodes = new Set(activeLanguages.map((l) => l.code));
  const repo = createPrismaAuthRepository(db);

  return registerUserWithRepo(repo, rawInput, {
    activeLanguageCodes,
    cookieLocale: options.cookieLocale,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    assistedByUserId: options.assistedByUserId ?? null,
  });
}

export async function loginUser(
  rawInput: RawLoginInput,
  options: { ipAddress?: string | null; userAgent?: string | null } = {},
): Promise<LoginResult> {
  const db = getDb();
  const repo = createPrismaAuthRepository(db);
  return loginUserWithRepo(repo, rawInput, options);
}

export async function getCurrentUser(
  token: string,
): Promise<ActiveSessionUser | null> {
  const db = getDb();
  const repo = createPrismaAuthRepository(db);
  return validateSessionWithRepo(repo, token);
}

export async function logoutUser(token: string): Promise<boolean> {
  const db = getDb();
  const repo = createPrismaAuthRepository(db);
  return logoutWithRepo(repo, token);
}

export async function recoverPassword(
  rawInput: RawRecoverInput,
  options: { ipAddress?: string | null } = {},
): Promise<{ success: true; message: string }> {
  const db = getDb();
  const repo = createPrismaAuthRepository(db);
  return recoverPasswordWithRepo(repo, rawInput, options);
}

export async function assistedRegisterFarmer(
  operatorUser: ActiveSessionUser,
  rawInput: RawRegisterInput,
  options: Omit<RegisterUserOptions, "assistedByUserId"> = {},
): Promise<RegistrationResult> {
  const [db, activeLanguages] = [getDb(), await getActiveLanguages()];
  const activeLanguageCodes = new Set(activeLanguages.map((l) => l.code));
  const repo = createPrismaAuthRepository(db);

  return assistedRegisterFarmerWithRepo(repo, operatorUser, rawInput, {
    activeLanguageCodes,
    cookieLocale: options.cookieLocale,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
}

