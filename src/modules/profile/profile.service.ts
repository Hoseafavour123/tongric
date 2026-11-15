import { getDb } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";
import { getStorageProvider } from "@/lib/storage";
import {
  getBuyerProfileWithRepo,
  getFarmerProfileWithRepo,
  getLatestVerificationDocumentWithRepo,
  getTransportProfileWithRepo,
  listPendingVerificationsWithRepo,
  reviewVerificationDocumentWithRepo,
  saveBuyerProfileWithRepo,
  saveFarmerProfileWithRepo,
  saveTransportProfileWithRepo,
  submitVerificationDocumentWithRepo,
  type ProfileActor,
  type ProfileAuditContext,
} from "./profile-core";
import { PrismaProfileRepository } from "./profile-prisma-repo";
import type {
  AdminVerificationQueueItem,
  BuyerProfileSummary,
  FarmerProfileSummary,
  RawBuyerProfileInput,
  RawFarmerProfileInput,
  RawTransportProfileInput,
  TransportProfileSummary,
  VerificationDocumentSummary,
  VerificationStatus,
} from "./schemas";

function getProfileRepo() {
  return new PrismaProfileRepository(getDb());
}

/* -------------------------------------------------------------------------- */
/* Farmer Profile Service                                                     */
/* -------------------------------------------------------------------------- */

export async function getFarmerProfile(
  userId: string,
): Promise<FarmerProfileSummary | null> {
  return getFarmerProfileWithRepo(getProfileRepo(), userId);
}

export async function saveFarmerProfile(
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawFarmerProfileInput,
  context?: ProfileAuditContext,
): Promise<FarmerProfileSummary> {
  return saveFarmerProfileWithRepo(
    getProfileRepo(),
    actor,
    targetUserId,
    rawInput,
    context,
  );
}

/* -------------------------------------------------------------------------- */
/* Buyer Profile Service                                                      */
/* -------------------------------------------------------------------------- */

export async function getBuyerProfile(
  userId: string,
): Promise<BuyerProfileSummary | null> {
  return getBuyerProfileWithRepo(getProfileRepo(), userId);
}

export async function saveBuyerProfile(
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawBuyerProfileInput,
  context?: ProfileAuditContext,
): Promise<BuyerProfileSummary> {
  return saveBuyerProfileWithRepo(
    getProfileRepo(),
    actor,
    targetUserId,
    rawInput,
    context,
  );
}

/* -------------------------------------------------------------------------- */
/* Transport Provider Profile Service                                         */
/* -------------------------------------------------------------------------- */

export async function getTransportProfile(
  userId: string,
): Promise<TransportProfileSummary | null> {
  return getTransportProfileWithRepo(getProfileRepo(), userId);
}

export async function saveTransportProfile(
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawTransportProfileInput,
  context?: ProfileAuditContext,
): Promise<TransportProfileSummary> {
  return saveTransportProfileWithRepo(
    getProfileRepo(),
    actor,
    targetUserId,
    rawInput,
    context,
  );
}

/* -------------------------------------------------------------------------- */
/* Verification Document Service                                              */
/* -------------------------------------------------------------------------- */

export async function submitVerificationDocument(
  actor: ProfileActor,
  targetUserId: string,
  rawInput: {
    documentType: unknown;
    documentNumber?: unknown;
  },
  fileMeta: {
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  },
  context?: ProfileAuditContext,
): Promise<VerificationDocumentSummary> {
  return submitVerificationDocumentWithRepo(
    getProfileRepo(),
    actor,
    targetUserId,
    rawInput,
    fileMeta,
    context,
  );
}

export async function getLatestVerificationDocument(
  actor: ProfileActor,
  targetUserId: string,
): Promise<VerificationDocumentSummary | null> {
  return getLatestVerificationDocumentWithRepo(
    getProfileRepo(),
    actor,
    targetUserId,
  );
}

export async function listPendingVerifications(
  actor: ProfileActor,
  filters?: {
    status?: VerificationStatus;
    limit?: number;
  },
): Promise<AdminVerificationQueueItem[]> {
  return listPendingVerificationsWithRepo(
    getProfileRepo(),
    actor,
    getStorageProvider(),
    filters,
  );
}

export async function getVerificationDocumentById(
  actor: ProfileActor,
  documentId: string,
): Promise<VerificationDocumentSummary | null> {
  const repo = getProfileRepo();
  const doc = await repo.findVerificationDocumentById(documentId);
  if (!doc) return null;
  if (actor.role !== "ADMIN" && actor.id !== doc.userId) {
    throw new ForbiddenError(
      "You do not have permission to view this document.",
    );
  }
  return doc;
}

export async function reviewVerificationDocument(
  actor: ProfileActor,
  documentId: string,
  rawReview: {
    decision: unknown;
    reason?: unknown;
  },
  context?: ProfileAuditContext,
): Promise<VerificationDocumentSummary> {
  return reviewVerificationDocumentWithRepo(
    getProfileRepo(),
    actor,
    documentId,
    rawReview,
    context,
  );
}
