"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { LoanApplicationSummary } from "@/modules/finance/schemas.ts";

interface LoanApplicationDetailViewProps {
  application: LoanApplicationSummary;
}

export function LoanApplicationDetailView({ application }: LoanApplicationDetailViewProps) {
  const snapshot = application.transactionSummarySnapshot;

  const STEPS = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "UNDER_PARTNER_REVIEW", label: "Under Review" },
    { key: "DECISION", label: application.status === "DECLINED" ? "Declined" : "Approved" },
  ];

  const currentStepIndex =
    application.status === "APPROVED" || application.status === "DECLINED"
      ? 2
      : application.status === "UNDER_PARTNER_REVIEW" || application.status === "ADDITIONAL_INFO_REQUESTED"
      ? 1
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-2">
        <Link
          href="/finance"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              {application.referenceCode}
            </span>
            <Badge
              tone={
                application.status === "APPROVED"
                  ? "green"
                  : application.status === "DECLINED"
                  ? "red"
                  : "amber"
              }
            >
              {application.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <h1 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
            {application.productTitle}
          </h1>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-0.5 z-0 ${
                        idx <= currentStepIndex ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isPast
                        ? "bg-green-700 text-white"
                        : isCurrent
                        ? application.status === "DECLINED"
                          ? "bg-red-600 text-white"
                          : "bg-green-700 text-white ring-4 ring-green-100"
                        : "bg-gray-100 text-gray-500 border border-gray-300"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>

                  <span
                    className={`mt-2 text-xs font-semibold ${
                      isCurrent ? "text-green-950 font-bold" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Partner Review Notes */}
      {application.partnerNote && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <span>Official Partner Review Note</span>
          </div>
          <p className="text-sm font-medium text-amber-950">
            {application.partnerNote}
          </p>
        </div>
      )}

      {/* Application Details */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100 bg-gray-50 pb-3">
          <CardTitle className="text-base text-gray-900">
            Application Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Financial Partner:</span>
              <div className="font-bold text-gray-900 text-sm mt-0.5 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{application.partnerName}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500">Requested Amount:</span>
              <div className="font-extrabold text-green-800 text-base mt-0.5">
                ₦{application.requestedAmountNgn.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <span className="text-gray-500">Declared Agricultural Purpose:</span>
            <p className="mt-1 font-medium text-gray-900 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
              {application.purpose}
            </p>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-3 text-gray-500">
            <span>Submitted On: {new Date(application.createdAt).toLocaleString()}</span>
            <span>Applicant: {application.farmerName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Attached Consented Snapshot */}
      {snapshot && (
        <Card className="border-green-200 bg-white">
          <CardHeader className="border-b border-gray-100 bg-green-50/50 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-green-700" />
              <CardTitle className="text-base text-gray-900">
                Verified Commercial Snapshot (Consented under NDPA 2023)
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg bg-green-50/40 p-3 border border-green-200/70 text-center">
              <div>
                <span className="text-gray-500">Completed Orders</span>
                <div className="text-base font-extrabold text-gray-900 mt-0.5">
                  {snapshot.completedOrdersCount}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Total Sales Volume</span>
                <div className="text-base font-extrabold text-gray-900 mt-0.5">
                  ₦{snapshot.totalSalesVolumeNgn.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-gray-500">KYC Status</span>
                <div className="text-base font-extrabold text-green-800 mt-0.5">
                  {snapshot.kycStatus}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Credit Score</span>
                <div className="text-base font-extrabold text-green-800 mt-0.5">
                  {snapshot.estimatedCreditScore} / 100
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-gray-500 pt-1">
              <span>Farm Location: <strong>{snapshot.locationLga} LGA, Benue</strong></span>
              <span>Recommended: <strong>{snapshot.recommendedTier}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Non-Custodial Footer */}
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 border border-gray-200">
        <ShieldCheck className="h-4 w-4 text-green-700 shrink-0" />
        <span>
          Section 19 Compliance: Tongric solely provides verified transaction snapshots; loan disbursement and repayments are managed directly between the farmer and {application.partnerName}.
        </span>
      </div>
    </div>
  );
}

