import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { StorageProvider } from "@/lib/storage/types";
import {
  getLatestVerificationDocumentWithRepo,
  listPendingVerificationsWithRepo,
  reviewVerificationDocumentWithRepo,
  submitVerificationDocumentWithRepo,
} from "../profile-core";
import type {
  CreateVerificationDocumentInput,
  ProfileRepository,
  UpdateVerificationStatusInput,
} from "../profile-repo";
import type {
  AdminVerificationQueueItem,
  VerificationDocumentSummary,
} from "../schemas";

describe("Verification Document Domain Logic", () => {
  function createMockRepo() {
    const docs = new Map<string, VerificationDocumentSummary>();
    const audits: unknown[] = [];

    const repo: ProfileRepository = {
      findFarmerProfileByUserId: vi.fn(),
      upsertFarmerProfile: vi.fn(),
      findBuyerProfileByUserId: vi.fn(),
      upsertBuyerProfile: vi.fn(),
      findTransportProfileByUserId: vi.fn(),
      upsertTransportProfile: vi.fn(),

      createVerificationDocument: vi.fn(
        async (input: CreateVerificationDocumentInput) => {
          const doc: VerificationDocumentSummary = {
            id: `doc_${Date.now()}`,
            userId: input.userId,
            documentType: input.documentType,
            documentNumber: input.documentNumber,
            fileStoragePath: input.fileStoragePath,
            fileMimeType: input.fileMimeType,
            fileSizeBytes: input.fileSizeBytes,
            notes: null,
            status: "PENDING",
            reviewedByUserId: null,
            reviewedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          docs.set(doc.id, doc);
          return doc;
        },
      ),

      findVerificationDocumentById: vi.fn(async (id: string) => {
        return docs.get(id) ?? null;
      }),

      findLatestVerificationDocumentByUserId: vi.fn(async (userId: string) => {
        const userDocs = Array.from(docs.values()).filter(
          (d) => d.userId === userId,
        );
        return userDocs[userDocs.length - 1] ?? null;
      }),

      listVerificationDocuments: vi.fn(async (filters) => {
        const all = Array.from(docs.values());
        const filtered = filters?.status
          ? all.filter((d) => d.status === filters.status)
          : all;
        return filtered.map(
          (d): AdminVerificationQueueItem => ({
            ...d,
            user: {
              id: d.userId,
              fullName: "Test User",
              phoneNumber: "+2348031234567",
              role: "FARMER",
            },
          }),
        );
      }),

      updateVerificationStatus: vi.fn(
        async (input: UpdateVerificationStatusInput) => {
          const doc = docs.get(input.documentId);
          if (!doc) throw new NotFoundError("Document not found");
          const updated: VerificationDocumentSummary = {
            ...doc,
            status: input.status,
            notes: input.notes ?? null,
            reviewedByUserId: input.reviewedByUserId,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          };
          docs.set(doc.id, updated);
          return updated;
        },
      ),

      recordProfileAudit: vi.fn(async (audit) => {
        audits.push(audit);
      }),
    };

    const mockStorage: StorageProvider = {
      providerName: "local",
      upload: vi.fn(),
      getAccessUrl: vi.fn(async (key) => `https://signed.example.com/${key}`),
      delete: vi.fn(),
    };

    return { repo, docs, audits, mockStorage };
  }

  it("submits verification document, sets status to PENDING, and logs audit trail", async () => {
    const { repo, audits } = createMockRepo();

    const result = await submitVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      {
        documentType: "NATIONAL_ID",
        documentNumber: "12345678901",
      },
      {
        storagePath: "kyc/usr_farmer_1/nin.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 150000,
      },
      { ipAddress: "197.210.10.20" },
    );

    expect(result.userId).toBe("usr_farmer_1");
    expect(result.documentType).toBe("NATIONAL_ID");
    expect(result.status).toBe("PENDING");

    expect(audits).toHaveLength(1);
    expect(audits[0]).toEqual(
      expect.objectContaining({
        action: "VERIFICATION_DOCUMENT_SUBMITTED",
        actorUserId: "usr_farmer_1",
        entityId: result.id,
        entityType: "VerificationDocument",
        ipAddress: "197.210.10.20",
      }),
    );
  });

  it("rejects non-admin attempting to submit document for another user", async () => {
    const { repo } = createMockRepo();

    await expect(
      submitVerificationDocumentWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "usr_farmer_2",
        {
          documentType: "VOTERS_CARD",
        },
        {
          storagePath: "kyc/usr_farmer_2/pvc.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 120000,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows owner or admin to inspect latest verification document", async () => {
    const { repo } = createMockRepo();

    const created = await submitVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      { documentType: "NATIONAL_ID" },
      {
        storagePath: "kyc/usr_farmer_1/nin.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 120000,
      },
    );

    const doc = await getLatestVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
    );
    expect(doc?.id).toBe(created.id);

    const docAdmin = await getLatestVerificationDocumentWithRepo(
      repo,
      { id: "usr_admin_1", role: "ADMIN" },
      "usr_farmer_1",
    );
    expect(docAdmin?.id).toBe(created.id);

    await expect(
      getLatestVerificationDocumentWithRepo(
        repo,
        { id: "usr_buyer_1", role: "BUYER" },
        "usr_farmer_1",
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("allows admin to list pending verifications and generates signed preview URLs", async () => {
    const { repo, mockStorage } = createMockRepo();

    await submitVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      { documentType: "CAC_CERTIFICATE" },
      {
        storagePath: "kyc/usr_farmer_1/cac.pdf",
        mimeType: "application/pdf",
        sizeBytes: 300000,
      },
    );

    const items = await listPendingVerificationsWithRepo(
      repo,
      { id: "usr_admin_1", role: "ADMIN" },
      mockStorage,
      { status: "PENDING" },
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.previewUrl).toContain("https://signed.example.com/");
    expect(mockStorage.getAccessUrl).toHaveBeenCalledWith(
      "kyc/usr_farmer_1/cac.pdf",
      expect.objectContaining({
        visibility: "private",
        expiresInSeconds: 900,
      }),
    );
  });

  it("rejects non-admin viewing the verification queue", async () => {
    const { repo, mockStorage } = createMockRepo();

    await expect(
      listPendingVerificationsWithRepo(
        repo,
        { id: "usr_farmer_1", role: "FARMER" },
        mockStorage,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("admin can approve verification document and record status change audit", async () => {
    const { repo, audits } = createMockRepo();

    const created = await submitVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      { documentType: "DRIVERS_LICENSE" },
      {
        storagePath: "kyc/usr_farmer_1/dl.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 150000,
      },
    );

    const reviewed = await reviewVerificationDocumentWithRepo(
      repo,
      { id: "usr_admin_1", role: "ADMIN" },
      created.id,
      { decision: "VERIFY" },
    );

    expect(reviewed.status).toBe("VERIFIED");
    expect(reviewed.reviewedByUserId).toBe("usr_admin_1");

    const changeAudit = audits.find(
      (a) =>
        typeof a === "object" &&
        a !== null &&
        "action" in a &&
        a.action === "VERIFICATION_STATUS_CHANGED",
    ) as
      | { action: string; metadata: { newStatus: string; reason?: string } }
      | undefined;
    expect(changeAudit).toBeDefined();
    expect(changeAudit?.metadata.newStatus).toBe("VERIFIED");
  });

  it("admin can reject verification document with note", async () => {
    const { repo, audits } = createMockRepo();

    const created = await submitVerificationDocumentWithRepo(
      repo,
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      { documentType: "VOTERS_CARD" },
      {
        storagePath: "kyc/usr_farmer_1/pvc.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 150000,
      },
    );

    const reviewed = await reviewVerificationDocumentWithRepo(
      repo,
      { id: "usr_admin_1", role: "ADMIN" },
      created.id,
      { decision: "REJECT", reason: "Document is blurry" },
    );

    expect(reviewed.status).toBe("REJECTED");
    expect(reviewed.notes).toBe("Document is blurry");

    const changeAudit = audits.find(
      (a) =>
        typeof a === "object" &&
        a !== null &&
        "action" in a &&
        a.action === "VERIFICATION_STATUS_CHANGED",
    ) as
      | { action: string; metadata: { newStatus: string; reason?: string } }
      | undefined;
    expect(changeAudit).toBeDefined();
    expect(changeAudit?.metadata.newStatus).toBe("REJECTED");
    expect(changeAudit?.metadata.reason).toBe("Document is blurry");
  });
});
