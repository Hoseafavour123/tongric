"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileCheck2, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  FormField,
  Input,
  Textarea,
} from "@/components/ui";
import type { FinancingProductSummary, CreditEligibilitySummary } from "@/modules/finance/schemas";

interface LoanApplyViewProps {
  product: FinancingProductSummary;
  eligibility: CreditEligibilitySummary;
}

export function LoanApplyView({ product }: LoanApplyViewProps) {
  const [requestedAmount, setRequestedAmount] = useState<number | "">(product.minAmountNgn);
  const [purpose, setPurpose] = useState("");
  const [documentKey, setDocumentKey] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/finance"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Loan Application
          </h1>
          <p className="text-xs text-gray-600">
            {product.title} &bull; {product.partnerName}
          </p>
        </div>
      </div>

      {/* Requirements & Terms */}
      <Card className="border-gray-200 bg-white shadow-xs">
        <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-3 px-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-green-700" />
            <CardTitle className="text-sm font-bold text-gray-900">
              Requirements &amp; Terms
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-xs space-y-2 text-gray-700">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Facility Range:</span>
            <strong className="text-gray-900">
              ₦{product.minAmountNgn.toLocaleString()} &ndash; ₦{product.maxAmountNgn.toLocaleString()}
            </strong>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Interest Rate:</span>
            <strong className="text-green-800">{product.interestRateSummary}</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Repayment Period:</span>
            <strong className="text-gray-900">{product.repaymentTerms}</strong>
          </div>
          <div className="py-1 border-b border-gray-100">
            <span className="text-gray-500 block mb-0.5">Eligibility:</span>
            <span className="text-gray-800">{product.eligibilityText}</span>
          </div>
          {product.requiredDocuments && product.requiredDocuments.length > 0 && (
            <div className="pt-1">
              <span className="text-gray-500 block mb-0.5">Required Documents:</span>
              <span className="text-gray-800">{product.requiredDocuments.join(", ")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="border-gray-200 bg-white shadow-xs">
        <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-3 px-4">
          <CardTitle className="text-sm font-bold text-gray-900">
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <FormField
            label="Requested Amount (NGN)"
            required
          >
            {({ id }) => (
              <Input
                id={id}
                type="number"
                min={product.minAmountNgn}
                max={product.maxAmountNgn}
                step={1000}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value ? Number(e.target.value) : "")}
                className="min-h-[42px] bg-white text-base font-bold"
              />
            )}
          </FormField>

          <FormField
            label="Agricultural Purpose"
            required
          >
            {({ id }) => (
              <Textarea
                id={id}
                rows={3}
                placeholder="State the farming purpose for this loan..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="bg-white text-sm"
              />
            )}
          </FormField>

          <FormField
            label="Document Reference (Optional)"
          >
            {({ id }) => (
              <Input
                id={id}
                placeholder="e.g. ID or Cooperative card number"
                value={documentKey}
                onChange={(e) => setDocumentKey(e.target.value)}
                className="min-h-[42px] bg-white text-sm"
              />
            )}
          </FormField>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <span>Applications are closed during the demonstration pilot. Real applications will open with partner cooperatives soon.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/finance"
              className="min-h-[42px] inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </Link>

            <Button
              type="button"
              variant="primary"
              disabled={true}
              className="min-h-[42px] px-5 flex items-center gap-2 font-bold cursor-not-allowed opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Submit Application</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
