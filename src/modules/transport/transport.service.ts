import { getDb } from "@/lib/db";
import { createPrismaTransportRepository } from "./transport-prisma-repo.ts";
import {
  listOpenTransportRequestsWithRepo,
  listTransporterAssignmentsWithRepo,
  claimTransportOrderWithRepo,
  listVerifiedTransportersWithRepo,
  getTransportCorridors,
  submitCarrierReviewWithRepo,
  getCarrierReviewsWithRepo,
  getOrderReviewWithRepo,
  type TransportActor,
} from "./transport-core.ts";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
  CarrierReviewSummary,
} from "./schemas.ts";
import type { TransportCorridor } from "./corridors.ts";
import { dispatchNotification, type NotificationCategory } from "@/modules/notifications";

function getTransportRepo() {
  return createPrismaTransportRepository(getDb());
}

async function safeNotify(payload: {
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}) {
  try {
    await dispatchNotification(payload);
  } catch (err) {
    console.warn("Failed to dispatch transport notification:", err);
  }
}

export async function listOpenTransportRequests(): Promise<TransportRequestSummary[]> {
  return listOpenTransportRequestsWithRepo(getTransportRepo());
}

export async function listTransporterAssignments(
  actor: TransportActor,
): Promise<TransporterAssignmentSummary[]> {
  return listTransporterAssignmentsWithRepo(getTransportRepo(), actor);
}

export async function claimTransportOrder(
  actor: TransportActor,
  rawInput: unknown,
): Promise<TransporterAssignmentSummary> {
  return claimTransportOrderWithRepo(getTransportRepo(), actor, rawInput);
}

export async function listVerifiedTransporters(
  lga?: string,
): Promise<VerifiedTransporterSummary[]> {
  return listVerifiedTransportersWithRepo(getTransportRepo(), lga);
}

export function getCorridors(): readonly TransportCorridor[] {
  return getTransportCorridors();
}

export async function submitCarrierReview(
  actor: TransportActor,
  rawInput: unknown,
): Promise<CarrierReviewSummary> {
  const review = await submitCarrierReviewWithRepo(getTransportRepo(), actor, rawInput);

  if (review.transporterId) {
    await safeNotify({
      userId: review.transporterId,
      title: "New Carrier Rating",
      body: `You received a ${review.rating}-star rating for your haulage service.`,
      category: "SYSTEM_ALERT",
      entityType: "carrier_review",
      entityId: review.id,
      actionUrl: "/transport",
    });
  }

  return review;
}

export async function getCarrierReviews(
  transporterId: string,
): Promise<CarrierReviewSummary[]> {
  return getCarrierReviewsWithRepo(getTransportRepo(), transporterId);
}

export async function getOrderReview(
  actor: TransportActor,
  orderId: string,
): Promise<CarrierReviewSummary | null> {
  return getOrderReviewWithRepo(getTransportRepo(), actor, orderId);
}
