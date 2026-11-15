import type {
  CreateListingInput,
  ProduceListingSummary,
  ProduceGrade,
} from "./schemas.ts";

export interface CreateListingData extends CreateListingInput {
  farmerId: string;
  title: string;
  cropCategory: string;
  estimatedWeightKg: number;
}

export interface MarketplaceFilterOptions {
  cropCode?: string;
  lga?: string;
  grade?: ProduceGrade;
  status?: string;
}

export interface MarketplaceAuditInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface MarketplaceRepository {
  createListing(data: CreateListingData): Promise<ProduceListingSummary>;
  getListingById(id: string): Promise<ProduceListingSummary | null>;
  listListingsByFarmer(farmerId: string): Promise<ProduceListingSummary[]>;
  listActiveListings(filter?: MarketplaceFilterOptions): Promise<ProduceListingSummary[]>;
  recordMarketplaceAudit(entry: MarketplaceAuditInput): Promise<void>;
}
