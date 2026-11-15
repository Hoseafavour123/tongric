import type {
  AdminVerificationQueueItem,
  BuyerProfileSummary,
  DocumentType,
  FarmerProfileSummary,
  TransportProfileSummary,
  UpsertBuyerProfileInput,
  UpsertFarmerProfileInput,
  UpsertTransportProfileInput,
  VerificationDocumentSummary,
  VerificationStatus,
} from "./schemas";

export interface ProfileAuditInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export interface CreateVerificationDocumentInput {
  userId: string;
  documentType: DocumentType;
  documentNumber: string | null;
  fileStoragePath: string;
  fileMimeType: string;
  fileSizeBytes: number;
}

export interface UpdateVerificationStatusInput {
  documentId: string;
  targetUserId: string;
  status: VerificationStatus;
  notes?: string | null;
  reviewedByUserId: string;
}

export interface ProfileRepository {
  findFarmerProfileByUserId(userId: string): Promise<FarmerProfileSummary | null>;
  upsertFarmerProfile(
    userId: string,
    input: UpsertFarmerProfileInput,
  ): Promise<FarmerProfileSummary>;

  findBuyerProfileByUserId(userId: string): Promise<BuyerProfileSummary | null>;
  upsertBuyerProfile(
    userId: string,
    input: UpsertBuyerProfileInput,
  ): Promise<BuyerProfileSummary>;

  findTransportProfileByUserId(
    userId: string,
  ): Promise<TransportProfileSummary | null>;
  upsertTransportProfile(
    userId: string,
    input: UpsertTransportProfileInput,
  ): Promise<TransportProfileSummary>;

  createVerificationDocument(
    input: CreateVerificationDocumentInput,
  ): Promise<VerificationDocumentSummary>;
  findVerificationDocumentById(
    id: string,
  ): Promise<VerificationDocumentSummary | null>;
  findLatestVerificationDocumentByUserId(
    userId: string,
  ): Promise<VerificationDocumentSummary | null>;
  listVerificationDocuments(filters?: {
    status?: VerificationStatus;
    limit?: number;
  }): Promise<AdminVerificationQueueItem[]>;
  updateVerificationStatus(
    input: UpdateVerificationStatusInput,
  ): Promise<VerificationDocumentSummary>;

  recordProfileAudit(entry: ProfileAuditInput): Promise<void>;
}
