import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
  CarrierReviewSummary,
} from "./schemas.ts";

export interface TransporterProfileData {
  userId: string;
  operatorName: string;
  maxCapacityKg: number;
  operatingLgas: string[];
  isAvailable: boolean;
  verificationStatus: string;
}

export interface TransportAuditInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface SubmitCarrierReviewData {
  orderId: string;
  transporterId: string;
  reviewerId: string;
  rating: number;
  timelinessScore: number;
  cargoCareScore: number;
  communicationScore: number;
  comment: string | null;
}

export interface OrderReviewMetadata {
  id: string;
  orderCode: string;
  farmerId: string;
  buyerId: string;
  transporterId: string | null;
  status: string;
}

export interface TransportRepository {
  listOpenTransportRequests(): Promise<TransportRequestSummary[]>;
  listTransporterAssignments(transporterUserId: string): Promise<TransporterAssignmentSummary[]>;
  claimTransportOrder(
    orderId: string,
    transporterUserId: string,
    corridorRoute: string,
    estimatedFreightFee: number,
  ): Promise<TransporterAssignmentSummary>;
  listVerifiedTransporters(lga?: string): Promise<VerifiedTransporterSummary[]>;
  getTransporterProfile(userId: string): Promise<TransporterProfileData | null>;
  recordTransportAudit(entry: TransportAuditInput): Promise<void>;
  submitCarrierReview(data: SubmitCarrierReviewData): Promise<CarrierReviewSummary>;
  getReviewsForTransporter(transporterId: string): Promise<CarrierReviewSummary[]>;
  getReviewForOrder(orderId: string, reviewerId: string): Promise<CarrierReviewSummary | null>;
  getOrderForReview(orderId: string): Promise<OrderReviewMetadata | null>;
}

