import { Prisma, type PrismaClient } from "@prisma/client";
import { createAuditLogEntry } from "@/lib/audit-service";
import { ConflictError } from "@/lib/errors";
import type {
  AuthRepository,
  CreateRegisteredUserParams,
  ExistingIdentityMatch,
  RegisteredUserSummary,
} from "./auth-repo";
import { NDPA_PRIVACY_POLICY_VERSION } from "./schemas";

function mapUniqueConstraintError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.map(String)
      : typeof error.meta?.target === "string"
        ? [error.meta.target]
        : [];

    if (target.some((field) => field.toLowerCase().includes("email"))) {
      throw new ConflictError(
        "An account with this email address already exists.",
      );
    }

    throw new ConflictError(
      "An account with this Nigerian phone number already exists.",
    );
  }

  throw error;
}

/**
 * Prisma-backed auth repository executing registration, NDPA consent, recovery hashing,
 * and audit logging in a single serializable database transaction.
 */
export function createPrismaAuthRepository(db: PrismaClient): AuthRepository {
  return {
    async findExistingIdentity(input): Promise<ExistingIdentityMatch> {
      const [phoneMatch, emailMatch] = await Promise.all([
        db.user.findUnique({
          where: { phoneNumber: input.phoneNumber },
          select: { id: true },
        }),
        input.email
          ? db.user.findUnique({
              where: { email: input.email },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

      return {
        phoneExists: phoneMatch !== null,
        emailExists: emailMatch !== null,
      };
    },

    async userExistsById(userId: string): Promise<boolean> {
      const row = await db.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      return row !== null;
    },

    async createRegisteredUser(
      params: CreateRegisteredUserParams,
    ): Promise<RegisteredUserSummary> {
      try {
        return await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              fullName: params.fullName,
              phoneNumber: params.phoneNumber,
              email: params.email,
              passwordHash: params.passwordHash,
              role: params.role,
              preferredLanguageCode: params.preferredLanguageCode,
              assistedByUserId: params.assistedByUserId,
            },
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
              role: true,
              accountStatus: true,
              preferredLanguageCode: true,
              createdAt: true,
            },
          });

          await tx.consentRecord.createMany({
            data: params.consents.map((consent) => ({
              userId: user.id,
              consentType: consent.consentType,
              policyVersion: consent.policyVersion,
              granted: consent.granted,
              locale: consent.locale,
              ipAddress: consent.ipAddress,
              userAgent: consent.userAgent,
            })),
          });

          await tx.recoveryCode.create({
            data: {
              userId: user.id,
              codeHash: params.recoveryCodeHash,
            },
          });

          const optionalGranted =
            params.consents.find((c) => c.consentType === "OPTIONAL_UPDATES")
              ?.granted ?? false;

          await createAuditLogEntry(tx, {
            actorUserId: params.assistedByUserId ?? user.id,
            action: "USER_REGISTERED",
            entityType: "User",
            entityId: user.id,
            metadata: {
              role: user.role,
              preferredLanguageCode: user.preferredLanguageCode,
              hasOptionalEmail: user.email !== null,
              assistedByUserId: params.assistedByUserId,
              acceptedOptionalUpdates: optionalGranted,
              policyVersion: NDPA_PRIVACY_POLICY_VERSION,
            },
            ipAddress: params.audit.ipAddress,
          });

          return user;
        });
      } catch (error) {
        mapUniqueConstraintError(error);
      }
    },

    async recordSecurityAudit(input) {
      await createAuditLogEntry(db, {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
      });
    },

    async findUserByPhoneForLogin(phoneNumber) {
      return db.user.findUnique({
        where: { phoneNumber },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
          passwordHash: true,
          role: true,
          accountStatus: true,
          preferredLanguageCode: true,
        },
      });
    },

    async createSession(params) {
      return db.session.create({
        data: {
          userId: params.userId,
          sessionHash: params.sessionHash,
          expiresAt: params.expiresAt,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        select: {
          id: true,
          userId: true,
          sessionHash: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    },

    async findValidSession(sessionHash) {
      const session = await db.session.findUnique({
        where: { sessionHash },
        select: {
          id: true,
          expiresAt: true,
          revokedAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true,
              role: true,
              accountStatus: true,
              preferredLanguageCode: true,
              createdAt: true,
            },
          },
        },
      });

      if (!session || session.revokedAt !== null || session.expiresAt <= new Date()) {
        return null;
      }

      return {
        sessionId: session.id,
        user: session.user,
      };
    },

    async revokeSession(sessionHash) {
      const res = await db.session.updateMany({
        where: { sessionHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return res.count > 0;
    },

    async revokeAllUserSessions(userId) {
      const res = await db.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return res.count;
    },

    async findActiveRecoveryCodes(phoneNumber) {
      const user = await db.user.findUnique({
        where: { phoneNumber },
        select: {
          id: true,
          recoveryCodes: {
            where: { isUsed: false },
            select: { id: true, codeHash: true, isUsed: true },
          },
        },
      });
      if (!user) {
        return null;
      }
      return { userId: user.id, codes: user.recoveryCodes };
    },

    async consumeRecoveryCodeAndResetPassword(params) {
      await db.$transaction(async (tx) => {
        await tx.recoveryCode.update({
          where: { id: params.recoveryCodeId },
          data: { isUsed: true, usedAt: new Date() },
        });

        await tx.user.update({
          where: { id: params.userId },
          data: { passwordHash: params.newPasswordHash },
        });

        await tx.session.updateMany({
          where: { userId: params.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        await createAuditLogEntry(tx, {
          actorUserId: params.userId,
          action: "PASSWORD_RESET_RECOVERY_CODE",
          entityType: "User",
          entityId: params.userId,
          metadata: { recoveryCodeId: params.recoveryCodeId },
          ipAddress: params.ipAddress,
        });
      });
    },
  };
}

