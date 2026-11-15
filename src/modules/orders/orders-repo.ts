import type {
  CreateOfferInput,
  RespondOfferInput,
  CommercialOfferSummary,
  CommercialOfferDetailSummary,
  OfferStatus,
  OrderSummary,
  OrderDetailSummary,
} from "./schemas.ts";

export interface CreateOfferData extends CreateOfferInput {
  offerCode: string;
  buyerId: string;
  farmerId: string;
  unitCode: string;
  totalAmount: number;
  expiresAt: Date;
  proposedCollectionDateObj: Date | null;
}

export interface RespondOfferData extends RespondOfferInput {
  actorUserId: string;
  actorRole: string;
  newStatus: OfferStatus;
  newQuantity?: number;
  newUnitPrice?: number;
  newTotalAmount?: number;
  incrementCounterRound: boolean;
}

export interface ListingOfferMetadata {
  id: string;
  farmerId: string;
  title: string;
  cropCode: string;
  unitCode: string;
  quantity: number;
  pricePerUnit: number;
  minOrderQuantity: number;
  status: string;
  lga: string;
  community: string;
  primaryPhotoUrl: string | null;
}

export interface OrderAuditInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface OrdersFilterOptions {
  role?: "buyer" | "farmer";
  status?: string;
}

export interface OrdersRepository {
  createOffer(data: CreateOfferData): Promise<CommercialOfferDetailSummary>;
  getOfferById(id: string): Promise<CommercialOfferDetailSummary | null>;
  listOffersByUser(
    userId: string,
    filter?: OrdersFilterOptions,
  ): Promise<CommercialOfferSummary[]>;
  respondToOffer(
    offerId: string,
    data: RespondOfferData,
  ): Promise<CommercialOfferDetailSummary>;
  getListingForOffer(listingId: string): Promise<ListingOfferMetadata | null>;
  recordOrderAudit(entry: OrderAuditInput): Promise<void>;
  createOrderFromAcceptedOffer(
    offerId: string,
    actorUserId: string,
  ): Promise<{ order: OrderDetailSummary; autoDeclinedOfferIds: string[] }>;
  getOrderById(orderId: string): Promise<OrderDetailSummary | null>;
  listOrdersByUser(
    userId: string,
    filter?: OrdersFilterOptions,
  ): Promise<OrderSummary[]>;
}

