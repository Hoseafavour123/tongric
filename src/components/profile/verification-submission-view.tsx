"use client";

import { useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, ShieldAlert, Upload } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { compressImageFile } from "@/lib/media/image-compressor";
import type { TranslationKeyId } from "@/modules/i18n";
import type {
  DocumentType,
  VerificationDocumentSummary,
  VerificationStatus,
} from "@/modules/profile";

export interface VerificationSubmissionViewProps {
  initialDocument?: VerificationDocumentSummary | null;
  currentStatus?: VerificationStatus;
}

const DOCUMENT_TYPE_OPTIONS: Array<{
  value: DocumentType;
  labelKey: TranslationKeyId;
}> = [
  { value: "NATIONAL_ID", labelKey: "profile.verify.type.nationalId" },
  { value: "VOTERS_CARD", labelKey: "profile.verify.type.votersCard" },
  { value: "DRIVERS_LICENSE", labelKey: "profile.verify.type.driversLicense" },
  { value: "CAC_CERTIFICATE", labelKey: "profile.verify.type.cacCertificate" },
  { value: "COOPERATIVE_LETTER", labelKey: "profile.verify.type.cooperativeLetter" },
  {
    value: "COMMUNITY_ATTESTATION",
    labelKey: "profile.verify.type.communityAttestation",
  },
];

export function VerificationSubmissionView({
  initialDocument,
  currentStatus = "UNVERIFIED",
}: VerificationSubmissionViewProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [document, setDocument] = useState<VerificationDocumentSummary | null>(
    initialDocument ?? null,
  );
  const [status, setStatus] = useState<VerificationStatus>(
    initialDocument?.status ?? currentStatus,
  );
  const [documentType, setDocumentType] = useState<DocumentType | "">(
    initialDocument?.documentType ?? "",
  );
  const [documentNumber, setDocumentNumber] = useState(
    initialDocument?.documentNumber ?? "",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (selectedPreviewUrl && selectedPreviewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(selectedPreviewUrl);
      } catch {
        // ignore
      }
    }
    if (file && file.type.startsWith("image/") && typeof URL !== "undefined") {
      setSelectedPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedPreviewUrl(null);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!documentType) {
      setErrorMessage(t("profile.verify.missingTypeError"));
      return;
    }

    if (!selectedFile) {
      setErrorMessage(t("profile.verify.missingFileError"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Compress image client-side if applicable to conserve mobile data
      let fileToUpload = selectedFile;
      if (selectedFile.type.startsWith("image/")) {
        try {
          const compressionResult = await compressImageFile(selectedFile);
          fileToUpload = compressionResult.file;
        } catch {
          // Fall back to original file if compression fails
          fileToUpload = selectedFile;
        }
      }

      const formData = new FormData();
      formData.append("documentType", documentType);
      if (documentNumber.trim()) {
        formData.append("documentNumber", documentNumber.trim());
      }
      formData.append("file", fileToUpload);

      const res = await fetch("/api/profile/verify", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        setDocument(json.data.document);
        setStatus("PENDING");
        setSuccessMessage(t("profile.verify.submittedSuccess"));
        setSelectedFile(null);
        if (selectedPreviewUrl && selectedPreviewUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(selectedPreviewUrl);
          } catch {}
        }
        setSelectedPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(
          json.error?.message || "Failed to submit verification document.",
        );
      }
    } catch {
      setErrorMessage(
        "Network connection interrupted. Please check your data and retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function getStatusTone(): "neutral" | "amber" | "green" | "red" {
    switch (status) {
      case "VERIFIED":
        return "green";
      case "PENDING":
        return "amber";
      case "REJECTED":
        return "red";
      default:
        return "neutral";
    }
  }

  function getStatusLabel(): string {
    switch (status) {
      case "VERIFIED":
        return t("profile.status.verified");
      case "PENDING":
        return t("profile.status.pending");
      case "REJECTED":
        return t("profile.status.rejected");
      default:
        return t("profile.status.unverified");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Top Navigation Link */}
      <div className="mb-4">
        <Link
          href="/account"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("profile.farmer.backToAccount")}</span>
        </Link>
      </div>

      {/* Main Card */}
      <Card className="border border-gray-200 shadow-xs">
        <CardHeader className="space-y-2 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold text-gray-900">
              {t("profile.verify.title")}
            </CardTitle>
            <Badge tone={getStatusTone()} className="text-xs">
              {getStatusLabel()}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {t("profile.verify.subtitle")}
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Status Banners */}
          {status === "VERIFIED" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-900">
                    {t("profile.status.verified")}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    {t("profile.verify.verifiedAlert")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "PENDING" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">
                    {t("profile.status.pending")}
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    {t("profile.verify.pendingAlert")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900">
                    {t("profile.status.rejected")}
                  </h4>
                  <p className="text-xs text-red-800 mt-1">
                    {document?.notes
                      ? `${t("profile.verify.rejectedAlert")} Reason: ${document.notes}`
                      : t("profile.verify.rejectedAlert")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <Alert tone="success" title={successMessage} />
          )}

          {errorMessage && (
            <Alert tone="error" title={errorMessage} />
          )}

          {/* Submission Form (hidden or secondary if already verified) */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type Selector */}
            <FormField
              label={t("profile.verify.docTypeLabel")}
              htmlFor="verify-doctype-select"
              required
            >
              {({ id, describedBy, hasError }) => (
                <Select
                  id={id}
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(e.target.value as DocumentType)
                  }
                  required
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                >
                  <option value="">
                    -- {t("profile.verify.docTypePlaceholder")} --
                  </option>
                  {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            {/* Document / ID Number (Optional) */}
            <FormField
              label={t("profile.verify.docNumberLabel")}
              htmlFor="verify-docnumber-input"
            >
              {({ id, describedBy, hasError }) => (
                <Input
                  id={id}
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={t("profile.verify.docNumberPlaceholder")}
                  hasError={hasError}
                  aria-describedby={describedBy}
                  className="min-h-[44px]"
                />
              )}
            </FormField>

            {/* File Input */}
            <div className="space-y-2">
              <label
                htmlFor="verify-file-input"
                className="block text-sm font-semibold text-gray-900"
              >
                {t("profile.verify.fileLabel")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">
                {t("profile.verify.fileHint")}
              </p>

              <div className="mt-1 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="verify-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelected}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:min-h-[44px] file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  required
                />
              </div>

              {selectedFile && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-emerald-800 font-medium">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                  {selectedPreviewUrl && (
                    <div className="relative h-28 w-28 rounded-md border border-gray-200 overflow-hidden bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedPreviewUrl}
                        alt="Selected document preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full min-h-[44px]"
                disabled={isSubmitting}
              >
                <Upload className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? t("profile.verify.submittingButton")
                    : t("profile.verify.submitButton")}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
