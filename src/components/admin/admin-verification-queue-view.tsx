"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, ShieldCheck, X } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { resilientFetch } from "@/lib/resilient-fetch";
import { formatNigerianPhoneLocal } from "@/modules/auth/phone";
import type {
  AdminVerificationQueueItem,
  VerificationDocumentSummary,
  VerificationStatus,
} from "@/modules/profile";

export interface AdminVerificationQueueViewProps {
  initialItems?: AdminVerificationQueueItem[];
}

export function AdminVerificationQueueView({
  initialItems = [],
}: AdminVerificationQueueViewProps) {
  const { t } = useI18n();

  const [items, setItems] =
    useState<AdminVerificationQueueItem[]>(initialItems);
  const [filter, setFilter] = useState<VerificationStatus | "ALL">("PENDING");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  async function handleReview(
    documentId: string,
    decision: "VERIFY" | "REJECT",
    reason?: string,
  ) {
    setActiveActionId(documentId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await resilientFetch<{
        document: VerificationDocumentSummary;
      }>(`/api/admin/verifications/${documentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason: reason?.trim() || null,
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === documentId
              ? {
                  ...item,
                  status: res.data.document.status,
                  notes: res.data.document.notes,
                  reviewedAt: res.data.document.reviewedAt,
                }
              : item,
          ),
        );
        setSuccessMessage(
          decision === "VERIFY"
            ? t("admin.verify.approvedSuccess")
            : t("admin.verify.rejectedSuccess"),
        );
        setRejectingId(null);
        setRejectReason("");
      } else {
        setErrorMessage(res.error.message || "Failed to update review status.");
      }
    } catch {
      setErrorMessage(
        "Network connection interrupted. Please check connection and retry.",
      );
    } finally {
      setActiveActionId(null);
    }
  }

  function formatDocType(type: string): string {
    switch (type) {
      case "NATIONAL_ID":
        return t("profile.verify.type.nationalId");
      case "VOTERS_CARD":
        return t("profile.verify.type.votersCard");
      case "DRIVERS_LICENSE":
        return t("profile.verify.type.driversLicense");
      case "CAC_CERTIFICATE":
        return t("profile.verify.type.cacCertificate");
      case "COOPERATIVE_LETTER":
        return t("profile.verify.type.cooperativeLetter");
      case "COMMUNITY_ATTESTATION":
        return t("profile.verify.type.communityAttestation");
      default:
        return type;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Top Navigation */}
      <div className="mb-4">
        <Link
          href="/account"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("profile.farmer.backToAccount")}</span>
        </Link>
      </div>

      <Card className="border border-gray-200 shadow-xs">
        <CardHeader className="space-y-2 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <CardTitle className="text-xl font-bold text-gray-900">
                {t("admin.verify.title")}
              </CardTitle>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {filteredItems.length} submission(s)
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {t("admin.verify.subtitle")}
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(
              [
                { key: "PENDING", label: t("admin.verify.filterPending") },
                { key: "ALL", label: t("admin.verify.filterAll") },
                { key: "VERIFIED", label: t("admin.verify.filterVerified") },
                { key: "REJECTED", label: t("admin.verify.filterRejected") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === tab.key
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {successMessage && (
            <Alert tone="success" title={successMessage} />
          )}

          {errorMessage && (
            <Alert tone="error" title={errorMessage} />
          )}

          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              {t("admin.verify.noPending")}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isActioning = activeActionId === item.id;
                const isRejectOpen = rejectingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.user.fullName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {formatNigerianPhoneLocal(item.user.phoneNumber)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge tone="neutral" className="text-xs">
                          {item.user.role}
                        </Badge>
                        <Badge
                          tone={
                            item.status === "VERIFIED"
                              ? "green"
                              : item.status === "PENDING"
                                ? "amber"
                                : "red"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-3 text-xs sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-gray-500">
                          {t("admin.verify.docHeader")}:{" "}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatDocType(item.documentType)}
                        </span>
                        {item.documentNumber && (
                          <span className="block text-gray-600">
                            #{item.documentNumber}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="font-medium text-gray-500">
                          {t("admin.verify.dateHeader")}:{" "}
                        </span>
                        <span className="text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-800">
                        <span className="font-semibold">Review note: </span>
                        {item.notes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      {item.previewUrl ? (
                        <a
                          href={item.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{t("admin.verify.viewDoc")}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No preview link
                        </span>
                      )}

                      {item.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isActioning}
                            onClick={() => handleReview(item.id, "VERIFY")}
                            className="min-h-[44px] gap-1"
                          >
                            <Check className="h-4 w-4" />
                            <span>{t("admin.verify.approveButton")}</span>
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isActioning}
                            onClick={() =>
                              setRejectingId(isRejectOpen ? null : item.id)
                            }
                            className="min-h-[44px] gap-1"
                          >
                            <X className="h-4 w-4" />
                            <span>{t("admin.verify.rejectButton")}</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Inline Rejection Reason Prompt */}
                    {isRejectOpen && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2">
                        <label
                          htmlFor={`reject-reason-${item.id}`}
                          className="block text-xs font-semibold text-red-950"
                        >
                          {t("admin.verify.rejectReasonPrompt")}
                        </label>
                        <input
                          id={`reject-reason-${item.id}`}
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Document blurry or expired; please re-upload"
                          className="min-h-[44px] w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="min-h-[44px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isActioning || !rejectReason.trim()}
                            onClick={() =>
                              handleReview(item.id, "REJECT", rejectReason)
                            }
                            className="min-h-[44px]"
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
