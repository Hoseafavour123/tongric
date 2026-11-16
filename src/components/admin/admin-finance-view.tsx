"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  FormField,
  Select,
  Textarea,
  Input,
  Dialog,
  Alert,
} from "@/components/ui";
import { AdminNavBar } from "./admin-nav-bar.tsx";
import {
  LoanApplicationSummary,
  FinancingProductSummary,
  LoanApplicationStatus,
} from "@/modules/finance/schemas.ts";

interface AdminFinanceViewProps {
  initialApplications: LoanApplicationSummary[];
  products: FinancingProductSummary[];
}

export function AdminFinanceView({ initialApplications }: AdminFinanceViewProps) {
  const [applications, setApplications] = useState<LoanApplicationSummary[]>(initialApplications);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [selectedApp, setSelectedApp] = useState<LoanApplicationSummary | null>(null);
  const [newStatus, setNewStatus] = useState<LoanApplicationStatus>("UNDER_PARTNER_REVIEW");
  const [partnerNote, setPartnerNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.referenceCode.toLowerCase().includes(q) ||
        app.farmerName.toLowerCase().includes(q) ||
        app.productTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const submittedCount = applications.filter((a) => a.status === "SUBMITTED").length;
  const underReviewCount = applications.filter((a) => a.status === "UNDER_PARTNER_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const declinedCount = applications.filter((a) => a.status === "DECLINED").length;

  function openReviewDialog(app: LoanApplicationSummary) {
    setSelectedApp(app);
    setNewStatus(app.status === "SUBMITTED" ? "UNDER_PARTNER_REVIEW" : app.status);
    setPartnerNote(app.partnerNote ?? "");
    setError(null);
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/finance/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          partnerNote: partnerNote.trim() || null,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Failed to update loan application");
      }

      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? body.data : a)),
      );
      setSuccess(`Application ${selectedApp.referenceCode} updated to ${newStatus.replace(/_/g, " ")}`);
      setSelectedApp(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update application");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Loan Partner Applicants
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Review cooperative loan applications ({applications.length}).
        </p>
      </div>

      <AdminNavBar activeTab="finance" loanApplicationsCount={submittedCount + underReviewCount} />

      {error && (
        <Alert tone="error" title="Action Error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert tone="success" title="Application Updated">
          {success}
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Submitted
            </span>
            <div className="text-xl font-extrabold text-amber-700 mt-0.5">
              {submittedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Under Review
            </span>
            <div className="text-xl font-extrabold text-blue-700 mt-0.5">
              {underReviewCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Approved
            </span>
            <div className="text-xl font-extrabold text-green-700 mt-0.5">
              {approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Declined
            </span>
            <div className="text-xl font-extrabold text-gray-500 mt-0.5">
              {declinedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-[40px] bg-white text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(["ALL", "SUBMITTED", "UNDER_PARTNER_REVIEW", "APPROVED", "DECLINED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Applications ({filteredApps.length})
        </h2>

        {filteredApps.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-500">
            No applications match the current filter.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredApps.map((app) => (
              <Card key={app.id} className="border-gray-200 bg-white shadow-xs">
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-green-900 bg-green-50 px-2 py-0.5 rounded border border-green-200">
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

                      <h3 className="mt-1 font-bold text-gray-900 text-sm">
                        {app.farmerName} &bull; {app.farmerPhone}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {app.productTitle} &bull; {app.partnerName}
                      </p>
                      {app.purpose && (
                        <p className="text-xs text-gray-500 truncate max-w-lg mt-0.5">
                          Purpose: {app.purpose}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-green-800">
                        ₦{app.requestedAmountNgn.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {app.partnerNote && (
                    <div className="rounded bg-gray-50 p-2 text-xs text-gray-700 border border-gray-200">
                      <strong>Note:</strong> {app.partnerNote}
                    </div>
                  )}

                  <div className="flex items-center justify-end border-t border-gray-100 pt-2">
                    <Button
                      variant="primary"
                      onClick={() => openReviewDialog(app)}
                      className="min-h-[36px] px-4 text-xs font-bold"
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedApp && (
        <Dialog
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Review: ${selectedApp.referenceCode}`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-3 pt-1">
            <div className="rounded-lg bg-gray-50 p-2.5 space-y-1 text-xs">
              <div className="font-bold text-gray-900">
                {selectedApp.farmerName} ({selectedApp.farmerPhone})
              </div>
              <div className="text-gray-600">Facility: {selectedApp.productTitle}</div>
              <div className="font-bold text-green-800">Requested: ₦{selectedApp.requestedAmountNgn.toLocaleString()}</div>
            </div>

            <FormField label="Status Decision" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LoanApplicationStatus)}
                  className="min-h-[40px] bg-white text-xs"
                >
                  <option value="UNDER_PARTNER_REVIEW">UNDER PARTNER REVIEW</option>
                  <option value="ADDITIONAL_INFO_REQUESTED">ADDITIONAL INFO REQUESTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="DECLINED">DECLINED</option>
                </Select>
              )}
            </FormField>

            <FormField
              label="Review Note (Optional)"
            >
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  rows={2}
                  placeholder="Feedback or conditions..."
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  className="bg-white text-xs"
                />
              )}
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedApp(null)}
                className="min-h-[40px] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updating}
                className="min-h-[40px] text-xs flex items-center gap-1.5 font-bold"
              >
                <Check className="h-4 w-4" />
                <span>{updating ? "Saving..." : "Save Decision"}</span>
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
