import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

const mockRequireRole = vi.fn();
const mockListPendingVerifications = vi.fn();
const mockReviewVerificationDocument = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}));

vi.mock("@/modules/profile", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/profile")>();
  return {
    ...actual,
    listPendingVerifications: (...args: unknown[]) =>
      mockListPendingVerifications(...args),
    reviewVerificationDocument: (...args: unknown[]) =>
      mockReviewVerificationDocument(...args),
  };
});

import { GET } from "../route";
import { POST as ReviewPOST } from "../[id]/review/route";

describe("Admin Verification API Routes", () => {
  const adminSession = {
    sessionId: "sess_admin",
    user: {
      id: "usr_admin_1",
      fullName: "Makurdi Admin",
      role: "ADMIN" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "en",
    },
  };

  it("GET returns 401 when unauthenticated", async () => {
    mockRequireRole.mockRejectedValueOnce(
      new UnauthorizedError("Authentication required"),
    );

    const res = await GET(
      new Request("http://localhost/api/admin/verifications"),
    );
    expect(res.status).toBe(401);
  });

  it("GET returns 403 when user is not an ADMIN", async () => {
    mockRequireRole.mockRejectedValueOnce(
      new ForbiddenError("Only administrators can perform this action"),
    );

    const res = await GET(
      new Request("http://localhost/api/admin/verifications"),
    );
    expect(res.status).toBe(403);
  });

  it("GET returns 200 with queue items for admin", async () => {
    mockRequireRole.mockResolvedValueOnce(adminSession);
    mockListPendingVerifications.mockResolvedValueOnce([
      {
        id: "doc_1",
        userId: "usr_farmer_1",
        documentType: "NATIONAL_ID",
        documentNumber: "12345678901",
        fileStoragePath: "kyc/usr_farmer_1/nin.jpg",
        fileMimeType: "image/jpeg",
        fileSizeBytes: 120000,
        notes: null,
        status: "PENDING",
        reviewedByUserId: null,
        reviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "usr_farmer_1",
          fullName: "Tersoo Vembe",
          phoneNumber: "+2348031234567",
          role: "FARMER",
        },
        previewUrl: "https://signed.example.com/kyc/nin.jpg",
      },
    ]);

    const res = await GET(
      new Request("http://localhost/api/admin/verifications?status=PENDING"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(mockListPendingVerifications).toHaveBeenCalledWith(
      { id: "usr_admin_1", role: "ADMIN" },
      { status: "PENDING", limit: undefined },
    );
  });

  it("POST review approves participant verification", async () => {
    mockRequireRole.mockResolvedValueOnce(adminSession);
    mockReviewVerificationDocument.mockResolvedValueOnce({
      id: "doc_1",
      userId: "usr_farmer_1",
      documentType: "NATIONAL_ID",
      documentNumber: "12345678901",
      fileStoragePath: "kyc/usr_farmer_1/nin.jpg",
      fileMimeType: "image/jpeg",
      fileSizeBytes: 120000,
      notes: null,
      status: "VERIFIED",
      reviewedByUserId: "usr_admin_1",
      reviewedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await ReviewPOST(
      new Request("http://localhost/api/admin/verifications/doc_1/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "VERIFY" }),
      }),
      { params: Promise.resolve({ id: "doc_1" }) },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockReviewVerificationDocument).toHaveBeenCalledWith(
      { id: "usr_admin_1", role: "ADMIN" },
      "doc_1",
      { decision: "VERIFY" },
      expect.anything(),
    );
  });

  it("POST review rejects participant verification with note", async () => {
    mockRequireRole.mockResolvedValueOnce(adminSession);
    mockReviewVerificationDocument.mockResolvedValueOnce({
      id: "doc_2",
      userId: "usr_farmer_2",
      documentType: "VOTERS_CARD",
      documentNumber: null,
      fileStoragePath: "kyc/usr_farmer_2/pvc.jpg",
      fileMimeType: "image/jpeg",
      fileSizeBytes: 120000,
      notes: "Document is blurry",
      status: "REJECTED",
      reviewedByUserId: "usr_admin_1",
      reviewedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await ReviewPOST(
      new Request("http://localhost/api/admin/verifications/doc_2/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "REJECT",
          reason: "Document is blurry",
        }),
      }),
      { params: Promise.resolve({ id: "doc_2" }) },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.document.status).toBe("REJECTED");
  });
});
