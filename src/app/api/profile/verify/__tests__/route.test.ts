import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const mockRequireAuth = vi.fn();
const mockSubmitVerificationDocument = vi.fn();
const mockGetLatestVerificationDocument = vi.fn();
const mockUpload = vi.fn();

vi.mock("@/modules/auth/guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/lib/storage", () => ({
  getStorageProvider: () => ({
    providerName: "local",
    upload: (...args: unknown[]) => mockUpload(...args),
    getAccessUrl: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/modules/profile", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/profile")>();
  return {
    ...actual,
    submitVerificationDocument: (...args: unknown[]) =>
      mockSubmitVerificationDocument(...args),
    getLatestVerificationDocument: (...args: unknown[]) =>
      mockGetLatestVerificationDocument(...args),
  };
});

import { GET, POST } from "../route";

describe("GET & POST /api/profile/verify", () => {
  const session = {
    sessionId: "sess_1",
    user: {
      id: "usr_farmer_1",
      fullName: "Tersoo Vembe",
      role: "FARMER" as const,
      accountStatus: "ACTIVE" as const,
      preferredLanguageCode: "tiv",
    },
  };

  it("GET returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValueOnce(
      new UnauthorizedError("You must be logged in."),
    );

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns 200 with document summary for authenticated user", async () => {
    mockRequireAuth.mockResolvedValueOnce(session);
    mockGetLatestVerificationDocument.mockResolvedValueOnce({
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
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.document.documentType).toBe("NATIONAL_ID");
  });

  it("POST uploads document and creates verification record", async () => {
    mockRequireAuth.mockResolvedValueOnce(session);
    mockUpload.mockResolvedValueOnce({
      key: "kyc/usr_farmer_1/nin.jpg",
      providerKey: "kyc/usr_farmer_1/nin.jpg",
      visibility: "private",
      mimeType: "image/jpeg",
      sizeBytes: 150000,
      publicUrl: null,
    });
    mockSubmitVerificationDocument.mockResolvedValueOnce({
      id: "doc_1",
      userId: "usr_farmer_1",
      documentType: "NATIONAL_ID",
      documentNumber: "12345678901",
      fileStoragePath: "kyc/usr_farmer_1/nin.jpg",
      fileMimeType: "image/jpeg",
      fileSizeBytes: 150000,
      notes: null,
      status: "PENDING",
      reviewedByUserId: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const formData = new FormData();
    formData.append("documentType", "NATIONAL_ID");
    formData.append("documentNumber", "12345678901");
    formData.append(
      "file",
      new File([new Uint8Array(100)], "nin.jpg", { type: "image/jpeg" }),
    );

    const res = await POST(
      new Request("http://localhost/api/profile/verify", {
        method: "POST",
        body: formData,
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockUpload).toHaveBeenCalled();
    expect(mockSubmitVerificationDocument).toHaveBeenCalledWith(
      { id: "usr_farmer_1", role: "FARMER" },
      "usr_farmer_1",
      {
        documentType: "NATIONAL_ID",
        documentNumber: "12345678901",
      },
      expect.objectContaining({
        storagePath: "kyc/usr_farmer_1/nin.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 150000,
      }),
      expect.anything(),
    );
  });

  it("POST returns 400 when file is missing", async () => {
    mockRequireAuth.mockResolvedValueOnce(session);

    const formData = new FormData();
    formData.append("documentType", "NATIONAL_ID");

    const res = await POST(
      new Request("http://localhost/api/profile/verify", {
        method: "POST",
        body: formData,
      }),
    );

    expect(res.status).toBe(400);
  });
});
