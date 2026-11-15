import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { AllowedMimeType, StorageProvider } from "@/lib/storage/types";
import type { ProfileRepository } from "./profile-repo";
import {
  adminReviewSchema,
  buyerProfileSchema,
  farmerProfileSchema,
  transportProfileSchema,
  verificationSubmissionSchema,
  type AdminVerificationQueueItem,
  type BuyerProfileSummary,
  type FarmerProfileSummary,
  type RawBuyerProfileInput,
  type RawFarmerProfileInput,
  type RawTransportProfileInput,
  type TransportProfileSummary,
  type VerificationDocumentSummary,
  type VerificationStatus,
} from "./schemas";

export interface ProfileActor {
  id: string;
  role: string;
}

export interface ProfileAuditContext {
  ipAddress?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Farmer Profile Operations                                                  */
/* -------------------------------------------------------------------------- */

export async function getFarmerProfileWithRepo(
  repo: ProfileRepository,
  targetUserId: string,
): Promise<FarmerProfileSummary | null> {
  return repo.findFarmerProfileByUserId(targetUserId);
}

export async function saveFarmerProfileWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawFarmerProfileInput,
  context?: ProfileAuditContext,
): Promise<FarmerProfileSummary> {
  if (actor.id !== targetUserId && actor.role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to update this profile.");
  }

  const validated = farmerProfileSchema.parse(rawInput);
  const profile = await repo.upsertFarmerProfile(targetUserId, validated);

  await repo.recordProfileAudit({
    actorUserId: actor.id,
    action: "FARMER_PROFILE_UPDATED",
    entityType: "FarmerProfile",
    entityId: profile.id,
    metadata: {
      targetUserId,
      lga: validated.lga,
      cropsCount: validated.primaryCrops.length,
      hasCooperative: Boolean(validated.cooperativeName),
      farmSizeHectares: validated.farmSizeHectares,
    },
    ipAddress: context?.ipAddress ?? null,
  });

  return profile;
}

/* -------------------------------------------------------------------------- */
/* Buyer Profile Operations                                                   */
/* -------------------------------------------------------------------------- */

export async function getBuyerProfileWithRepo(
  repo: ProfileRepository,
  targetUserId: string,
): Promise<BuyerProfileSummary | null> {
  return repo.findBuyerProfileByUserId(targetUserId);
}

export async function saveBuyerProfileWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawBuyerProfileInput,
  context?: ProfileAuditContext,
): Promise<BuyerProfileSummary> {
  if (actor.id !== targetUserId && actor.role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to update this profile.");
  }

  const validated = buyerProfileSchema.parse(rawInput);
  const profile = await repo.upsertBuyerProfile(targetUserId, validated);

  await repo.recordProfileAudit({
    actorUserId: actor.id,
    action: "BUYER_PROFILE_UPDATED",
    entityType: "BuyerProfile",
    entityId: profile.id,
    metadata: {
      targetUserId,
      businessName: validated.businessName,
      buyerType: validated.buyerType,
      operatingLga: validated.operatingLga,
      cropsCount: validated.cropsSourced.length,
    },
    ipAddress: context?.ipAddress ?? null,
  });

  return profile;
}

/* -------------------------------------------------------------------------- */
/* Transport Provider Profile Operations                                      */
/* -------------------------------------------------------------------------- */

export async function getTransportProfileWithRepo(
  repo: ProfileRepository,
  targetUserId: string,
): Promise<TransportProfileSummary | null> {
  return repo.findTransportProfileByUserId(targetUserId);
}

export async function saveTransportProfileWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  targetUserId: string,
  rawInput: RawTransportProfileInput,
  context?: ProfileAuditContext,
): Promise<TransportProfileSummary> {
  if (actor.id !== targetUserId && actor.role !== "ADMIN") {
    throw new ForbiddenError("You do not have permission to update this profile.");
  }

  const validated = transportProfileSchema.parse(rawInput);
  const profile = await repo.upsertTransportProfile(targetUserId, validated);

  await repo.recordProfileAudit({
    actorUserId: actor.id,
    action: "TRANSPORTER_PROFILE_UPDATED",
    entityType: "TransportProfile",
    entityId: profile.id,
    metadata: {
      targetUserId,
      operatorName: validated.operatorName,
      vehicleTypes: validated.vehicleTypes,
      maxCapacityKg: validated.maxCapacityKg,
      operatingLgasCount: validated.operatingLgas.length,
      isAvailable: validated.isAvailable,
      pricingModel: validated.pricingModel,
    },
    ipAddress: context?.ipAddress ?? null,
  });

  return profile;
}

/* -------------------------------------------------------------------------- */
/* Verification Document Operations                                           */
/* -------------------------------------------------------------------------- */

export async function submitVerificationDocumentWithRepo(
  repo: ProfileRepository,
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
  if (actor.id !== targetUserId && actor.role !== "ADMIN") {
    throw new ForbiddenError(
      "You do not have permission to submit documents for this account.",
    );
  }

  const validated = verificationSubmissionSchema.parse(rawInput);

  const doc = await repo.createVerificationDocument({
    userId: targetUserId,
    documentType: validated.documentType,
    documentNumber: validated.documentNumber,
    fileStoragePath: fileMeta.storagePath,
    fileMimeType: fileMeta.mimeType,
    fileSizeBytes: fileMeta.sizeBytes,
  });

  await repo.recordProfileAudit({
    actorUserId: actor.id,
    action: "VERIFICATION_DOCUMENT_SUBMITTED",
    entityType: "VerificationDocument",
    entityId: doc.id,
    metadata: {
      targetUserId,
      documentType: doc.documentType,
      fileSizeBytes: doc.fileSizeBytes,
      fileMimeType: doc.fileMimeType,
    },
    ipAddress: context?.ipAddress ?? null,
  });

  return doc;
}

export async function getLatestVerificationDocumentWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  targetUserId: string,
): Promise<VerificationDocumentSummary | null> {
  if (actor.id !== targetUserId && actor.role !== "ADMIN") {
    throw new ForbiddenError(
      "You do not have permission to view this document.",
    );
  }

  return repo.findLatestVerificationDocumentByUserId(targetUserId);
}

export async function listPendingVerificationsWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  storageProvider: StorageProvider,
  filters?: {
    status?: VerificationStatus;
    limit?: number;
  },
): Promise<AdminVerificationQueueItem[]> {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only administrators can view the verification queue.",
    );
  }

  const items = await repo.listVerificationDocuments(filters);

  // Generate short-lived signed access URLs (15 mins TTL) for admin review
  const itemsWithPreviews = await Promise.all(
    items.map(async (item) => {
      try {
        const previewUrl = await storageProvider.getAccessUrl(
          item.fileStoragePath,
          {
            visibility: "private",
            mimeType: item.fileMimeType as AllowedMimeType,
            expiresInSeconds: 900,
          },
        );
        return { ...item, previewUrl };
      } catch {
        return item;
      }
    }),
  );

  return itemsWithPreviews;
}

export async function reviewVerificationDocumentWithRepo(
  repo: ProfileRepository,
  actor: ProfileActor,
  documentId: string,
  rawReview: {
    decision: unknown;
    reason?: unknown;
  },
  context?: ProfileAuditContext,
): Promise<VerificationDocumentSummary> {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only administrators can review verification submissions.",
    );
  }

  const doc = await repo.findVerificationDocumentById(documentId);
  if (!doc) {
    throw new NotFoundError("Verification document not found.");
  }

  const validated = adminReviewSchema.parse(rawReview);
  const newStatus: VerificationStatus =
    validated.decision === "VERIFY" ? "VERIFIED" : "REJECTED";

  const updated = await repo.updateVerificationStatus({
    documentId,
    targetUserId: doc.userId,
    status: newStatus,
    notes: validated.reason,
    reviewedByUserId: actor.id,
  });

  await repo.recordProfileAudit({
    actorUserId: actor.id,
    action: "VERIFICATION_STATUS_CHANGED",
    entityType: "VerificationDocument",
    entityId: doc.id,
    metadata: {
      targetUserId: doc.userId,
      previousStatus: doc.status,
      newStatus,
      reason: validated.reason,
    },
    ipAddress: context?.ipAddress ?? null,
  });

  return updated;
}
