"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coins,
  FileCheck2,
  ArrowRight,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  buttonClasses,
  Button,
} from "@/components/ui";
import {
  FinancingProductSummary,
  LoanApplicationSummary,
  CreditEligibilitySummary,
} from "@/modules/finance/schemas";
import { useAuth } from "@/components/auth/auth-provider";

interface FinanceHubViewProps {
  products: FinancingProductSummary[];
  initialApplications?: LoanApplicationSummary[];
  initialEligibility?: CreditEligibilitySummary | null;
  hideHeader?: boolean;
}

export function FinanceHubView({
  products,
  initialApplications = [],
  hideHeader = false,
}: FinanceHubViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "applications">("products");

  const displayedProduct = products[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-green-100 p-2 text-green-800">
                <Coins className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Agricultural Finance & Credit
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Accredited cooperative lending directory and agricultural credit facilities.
            </p>
          </div>

          <Badge tone="green">Cooperative Credit</Badge>
        </div>
      )}

      {/* Tab Navigation (Credit readiness and produce barter hidden for now) */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`min-h-[44px] flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "products"
              ? "border-b-2 border-green-700 bg-green-50/50 text-green-800"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Cooperative Financing</span>
        </button>

        {user && (
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`min-h-[44px] flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "applications"
                ? "border-b-2 border-green-700 bg-green-50/50 text-green-800"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>My Applications ({initialApplications.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Single Cooperative Product Listing */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Accredited Cooperative Financing Product
            </h2>
            <span className="text-xs text-gray-500 font-medium">Pilot Program</span>
          </div>

          {displayedProduct && (
            <Card className="max-w-xl border-gray-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="space-y-1.5">
                  <Badge tone="green">Cooperative Facility</Badge>
                  <CardTitle className="text-base text-gray-900 font-bold">
                    {displayedProduct.title}
                  </CardTitle>
                  <p className="text-xs font-semibold text-green-800">
                    Partner: {displayedProduct.partnerName}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-gray-600">
                  Seasonal input financing for certified seeds and fertilizer with flexible harvest-linked repayment.
                </p>

                <div className="rounded-lg bg-gray-50 p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Facility Limit:</span>
                    <strong className="text-gray-900">
                      ₦{displayedProduct.minAmountNgn.toLocaleString()} - ₦{displayedProduct.maxAmountNgn.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Indicative Rate:</span>
                    <strong className="text-green-800">{displayedProduct.interestRateSummary}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Repayment Terms:</span>
                    <strong className="text-gray-900">{displayedProduct.repaymentTerms}</strong>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <Link
                    href={`/finance/products/${displayedProduct.id}/apply`}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 text-xs font-semibold rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors opacity-80 hover:opacity-100"
                  >
                    <span>Apply with Cooperative</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: My Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Submitted Loan Demonstration Applications
            </h2>
            <span className="text-xs text-gray-500">Track partner decisions</span>
          </div>

          {initialApplications.length === 0 ? (
            <Card className="border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900">No Applications Submitted</h3>
              <p className="mt-1 text-sm text-gray-600">
                You have not submitted any financing applications yet. Browse the cooperative catalog to apply.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("products")}
                  className="min-h-[44px]"
                >
                  Browse Financing Products
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {initialApplications.map((app) => (
                <Card key={app.id} className="border-gray-200 bg-white shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-green-800">
                            {app.referenceCode}
                          </span>
                          <Badge
                            tone={
                              app.status === "APPROVED"
                                ? "green"
                                : app.status === "DECLINED"
                                ? "red"
                                : "amber"
                            }
                          >
                            {app.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <h4 className="mt-1 font-bold text-gray-900 text-sm">
                          {app.productTitle} &bull; {app.partnerName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-gray-900">
                          ₦{app.requestedAmountNgn.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600">
                      Purpose: {app.purpose}
                    </p>

                    {app.partnerNote && (
                      <div className="rounded-md bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
                        <strong>Partner Review Note:</strong> {app.partnerNote}
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Link
                        href={`/finance/applications/${app.id}`}
                        className={buttonClasses({
                          variant: "secondary",
                          className: "min-h-[44px] flex items-center gap-1.5 text-xs font-semibold",
                        })}
                      >
                        <span>View Status & Shared Snapshot</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

