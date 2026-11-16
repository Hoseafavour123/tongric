import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { TransportRepository } from "./transport-repo.ts";
import {
  claimTransportOrderSchema,
  submitCarrierReviewSchema,
  type TransportRequestSummary,
  type TransporterAssignmentSummary,
  type VerifiedTransporterSummary,
  type CarrierReviewSummary,
} from "./schemas.ts";
import {
  BENUE_TRANSPORT_CORRIDORS,
  findCorridorByLgas,
  calculateCorridorFreightFee,
  type TransportCorridor,
} from "./corridors.ts";

export interface TransportActor {
  id: string;
  role: string;
}

export async function listOpenTransportRequestsWithRepo(
  repo: TransportRepository,
): Promise<TransportRequestSummary[]> {
  return repo.listOpenTransportRequests();
}

export async function listTransporterAssignmentsWithRepo(
  repo: TransportRepository,
  actor: TransportActor,
): Promise<TransporterAssignmentSummary[]> {
  return repo.listTransporterAssignments(actor.id);
}

export async function claimTransportOrderWithRepo(
  repo: TransportRepository,
  actor: TransportActor,
  rawInput: unknown,
): Promise<TransporterAssignmentSummary> {
  const parsed = claimTransportOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid claim request");
  }

  const { orderId } = parsed.data;

  const isTransporter = actor.role === "TRANSPORT_PROVIDER";
  const isAdmin = actor.role === "ADMIN";

  if (!isTransporter && !isAdmin) {
    throw new ForbiddenError(
      "Only registered transport providers or administrators can claim cargo haulage routes.",
    );
  }

  // Transporter profile and capacity check
  const profile = await repo.getTransporterProfile(actor.id);
  if (!profile && !isAdmin) {
    throw new ValidationError(
      "Please complete your transport provider profile before claiming haulage routes.",
    );
  }

  const openRequests = await repo.listOpenTransportRequests();
  const targetRequest = openRequests.find((r) => r.id === orderId);

  if (!targetRequest) {
    throw new NotFoundError(
      "Transport order not found or is no longer open for haulage assignment.",
    );
  }

  // Capacity safety check
  if (profile && targetRequest.estimatedWeightKg > profile.maxCapacityKg) {
    throw new ValidationError(
      `Cargo payload (~${targetRequest.estimatedWeightKg} kg) exceeds your vehicle registered capacity of ${profile.maxCapacityKg} kg.`,
    );
  }

  // Determine corridor route and estimated freight fee
  const corridor = findCorridorByLgas(
    targetRequest.listingLga,
    targetRequest.destinationLocation,
  );
  const freightFee = calculateCorridorFreightFee(
    corridor,
    targetRequest.estimatedWeightKg,
  );

  return repo.claimTransportOrder(
    orderId,
    actor.id,
    corridor.name,
    freightFee,
  );
}

export async function listVerifiedTransportersWithRepo(
  repo: TransportRepository,
  lga?: string,
): Promise<VerifiedTransporterSummary[]> {
  return repo.listVerifiedTransporters(lga);
}

export function getTransportCorridors(): readonly TransportCorridor[] {
  return BENUE_TRANSPORT_CORRIDORS;
}

export async function submitCarrierReviewWithRepo(
  repo: TransportRepository,
  actor: TransportActor,
  rawInput: unknown,
): Promise<CarrierReviewSummary> {
  const parsed = submitCarrierReviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ValidationError(firstIssue?.message ?? "Invalid review details");
  }

  const { orderId, rating, timelinessScore, cargoCareScore, communicationScore, comment } =
    parsed.data;

  const order = await repo.getOrderForReview(orderId);
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (!order.transporterId) {
    throw new ValidationError("This order does not have an assigned transport carrier to review.");
  }

  if (order.status !== "DELIVERED" && order.status !== "COMPLETED") {
    throw new ValidationError(
      "Carrier reviews can only be submitted after produce has been successfully delivered or completed.",
    );
  }

  const isParty = actor.id === order.farmerId || actor.id === order.buyerId;
  const isAdmin = actor.role === "ADMIN";

  if (!isParty && !isAdmin) {
    throw new ForbiddenError(
      "Only the buyer or farmer associated with this order can submit a carrier review.",
    );
  }

  if (actor.id === order.transporterId) {
    throw new ForbiddenError("Carriers cannot submit reviews on their own haulage service.");
  }

  const existingReview = await repo.getReviewForOrder(orderId, actor.id);
  if (existingReview) {
    throw new ValidationError("You have already submitted a performance review for this carrier on this order.");
  }

  return repo.submitCarrierReview({
    orderId,
    transporterId: order.transporterId,
    reviewerId: actor.id,
    rating,
    timelinessScore,
    cargoCareScore,
    communicationScore,
    comment,
  });
}

export async function getCarrierReviewsWithRepo(
  repo: TransportRepository,
  transporterId: string,
): Promise<CarrierReviewSummary[]> {
  return repo.getReviewsForTransporter(transporterId);
}

export async function getOrderReviewWithRepo(
  repo: TransportRepository,
  actor: TransportActor,
  orderId: string,
): Promise<CarrierReviewSummary | null> {
  return repo.getReviewForOrder(orderId, actor.id);
}


