import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminVerificationQueueView } from "@/components/admin/admin-verification-queue-view";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { VerificationSubmissionView } from "../verification-submission-view";
import type {
  AdminVerificationQueueItem,
  VerificationDocumentSummary,
} from "@/modules/profile";

describe("VerificationSubmissionView UI", () => {
  it("renders empty verification upload form with document types and instructions", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <VerificationSubmissionView initialDocument={null} currentStatus="UNVERIFIED" />
      </I18nProvider>,
    );

    expect(html).toContain("Verify Your Account");
    expect(html).toContain("Upload an ID or cooperative letter");
    expect(html).toContain("Unverified");

    // Document types in select
    expect(html).toContain("National ID (NIN Slip / Card)");
    expect(html).toContain("Voter&#x27;s Card (INEC PVC)");
    expect(html).toContain("Driver&#x27;s License (FRSC)");
    expect(html).toContain("CAC Certificate (Business)");
    expect(html).toContain("Cooperative Letter");
    expect(html).toContain("Community Attestation Letter");

    // File input & CTAs
    expect(html).toContain("Upload Photo or PDF Document");
    expect(html).toContain("Submit for Verification");
  });

  it("renders pending review alert when document is under review", () => {
    const mockDoc: VerificationDocumentSummary = {
      id: "doc_123",
      userId: "usr_456",
      documentType: "NATIONAL_ID",
      documentNumber: "12345678901",
      fileStoragePath: "kyc/usr_456/nin.jpg",
      fileMimeType: "image/jpeg",
      fileSizeBytes: 120000,
      notes: null,
      status: "PENDING",
      reviewedByUserId: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <VerificationSubmissionView
          initialDocument={mockDoc}
          currentStatus="PENDING"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Pending Review");
    expect(html).toContain("Your verification document is under review");
  });

  it("renders verified alert when participant is verified", () => {
    const mockDoc: VerificationDocumentSummary = {
      id: "doc_123",
      userId: "usr_456",
      documentType: "CAC_CERTIFICATE",
      documentNumber: "RC-123456",
      fileStoragePath: "kyc/usr_456/cac.pdf",
      fileMimeType: "application/pdf",
      fileSizeBytes: 200000,
      notes: null,
      status: "VERIFIED",
      reviewedByUserId: "usr_admin",
      reviewedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <VerificationSubmissionView
          initialDocument={mockDoc}
          currentStatus="VERIFIED"
        />
      </I18nProvider>,
    );

    expect(html).toContain("Verified");
    expect(html).toContain("Your account is verified. Trusted marketplace badge active.");
  });
});

describe("AdminVerificationQueueView UI", () => {
  it("renders admin verification queue with items, preview links, and approve/reject actions", () => {
    const mockItems: AdminVerificationQueueItem[] = [
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
        createdAt: new Date("2026-11-13"),
        updatedAt: new Date("2026-11-13"),
        user: {
          id: "usr_farmer_1",
          fullName: "Tersoo Vembe",
          phoneNumber: "+2348031234567",
          role: "FARMER",
        },
        previewUrl: "https://signed.example.com/kyc/nin.jpg",
      },
    ];

    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en" initialHasExplicitLocale>
        <AdminVerificationQueueView initialItems={mockItems} />
      </I18nProvider>,
    );

    expect(html).toContain("Verification Queue");
    expect(html).toContain("Tersoo Vembe");
    expect(html).toContain("FARMER");
    expect(html).toContain("National ID (NIN Slip / Card)");
    expect(html).toContain("#12345678901");
    expect(html).toContain("View Document");
    expect(html).toContain("Approve");
    expect(html).toContain("Reject");
  });
});
