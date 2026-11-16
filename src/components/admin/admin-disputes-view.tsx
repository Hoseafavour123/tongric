"use client";

import { useState } from "react";
import { Scale, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Dialog,
  FormField,
  Select,
  Textarea,
  Alert,
} from "@/components/ui";
import { AdminNavBar } from "./admin-nav-bar";
import type { AdminDisputeSummary } from "@/modules/admin/schemas";

interface AdminDisputesViewProps {
  initialDisputes: AdminDisputeSummary[];
}

export function AdminDisputesView({ initialDisputes }: AdminDisputesViewProps) {
  const [disputes, setDisputes] = useState<AdminDisputeSummary[]>(initialDisputes);
  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeSummary | null>(null);
  const [outcome, setOutcome] = useState<"RESOLVE_COMPLETED" | "RESOLVE_CANCELLED">("RESOLVE_COMPLETED");
  const [resolutionNote, setResolutionNote] = useState("");
  const [restoreInventory, setRestoreInventory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  function handleOpenMediation(dispute: AdminDisputeSummary) {
    setSelectedDispute(dispute);
    setOutcome("RESOLVE_COMPLETED");
    setResolutionNote("");
    setRestoreInventory(true);
    setDialogError(null);
  }

  async function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDispute) return;

    if (!resolutionNote.trim() || resolutionNote.trim().length < 5) {
      setDialogError("Please write a detailed resolution note explaining the arbitration decision (min 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setDialogError(null);

    try {
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          resolutionNote: resolutionNote.trim(),
          restoreInventory,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to resolve dispute.");
      }

      setDisputes((prev) => prev.filter((d) => d.id !== selectedDispute.id));
      setSuccessBanner(
        `Dispute on order ${selectedDispute.orderCode} successfully resolved as ${outcome === "RESOLVE_COMPLETED" ? "COMPLETED" : "CANCELLED"}. Notifications dispatched to all parties.`,
      );
      setSelectedDispute(null);
    } catch (err: unknown) {
      setDialogError(err instanceof Error ? err.message : "Failed to arbitrate dispute.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminNavBar activeTab="disputes" activeDisputesCount={disputes.length} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Dispute Mediation Queue
        </h1>
        <p className="text-sm text-gray-600">
          Arbitrate contested transactions, quality disagreements, or haulage handover issues between farmers, buyers, and transporters.
        </p>
      </div>

      {successBanner && (
        <Alert tone="success" title={successBanner} />
      )}

      {disputes.length === 0 ? (
        <Card className="border-gray-200 py-12 text-center bg-gray-50/50">
          <CardContent className="space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="text-base font-bold text-gray-900">Zero Active Disputes</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              All commercial orders and transit handovers across Benue corridors are operating cleanly without contested claims.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-gray-600 px-1">
            {disputes.length} order{disputes.length === 1 ? "" : "s"} under active dispute review
          </div>

          {disputes.map((dispute) => (
            <Card key={dispute.id} className="border-red-200 bg-white">
              <CardHeader className="pb-2 border-b border-gray-100">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-base font-bold text-gray-900">
                      Order {dispute.orderCode}
                    </CardTitle>
                    <Badge tone="red">Disputed</Badge>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₦{dispute.totalAmount.toLocaleString("en-NG")} • {dispute.quantity} {dispute.unitCode} {dispute.cropCode}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Dispute Reason Banner */}
                <div className="rounded-lg bg-red-50 p-3.5 border border-red-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-red-900">Reported Dispute Claim:</div>
                      <p className="text-xs text-red-800 mt-0.5 whitespace-pre-wrap">
                        {dispute.disputeReason || "No statement provided."}
                      </p>
                      {dispute.disputedAt && (
                        <div className="text-[11px] text-red-600 mt-1">
                          Filed: {new Date(dispute.disputedAt).toLocaleString("en-NG")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs bg-gray-50 rounded-lg p-3">
                  <div>
                    <span className="font-semibold text-gray-500 uppercase text-[10px]">Farmer (Consignor)</span>
                    <div className="font-bold text-gray-900 mt-0.5">{dispute.farmer.fullName}</div>
                    <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{dispute.farmer.phoneNumber}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 uppercase text-[10px]">Buyer (Consignee)</span>
                    <div className="font-bold text-gray-900 mt-0.5">{dispute.buyer.fullName}</div>
                    <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{dispute.buyer.phoneNumber}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 uppercase text-[10px]">Transport Carrier</span>
                    <div className="font-bold text-gray-900 mt-0.5">
                      {dispute.transporter ? dispute.transporter.fullName : "Self-arranged / unassigned"}
                    </div>
                    {dispute.transporter && (
                      <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{dispute.transporter.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenMediation(dispute)}
                    className="min-h-[44px] bg-red-700 hover:bg-red-800 text-xs font-bold flex items-center gap-2"
                  >
                    <Scale className="h-4 w-4" />
                    <span>Arbitrate &amp; Resolve Dispute</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mediation Dialog */}
      {selectedDispute && (
        <Dialog
          open={Boolean(selectedDispute)}
          onClose={() => setSelectedDispute(null)}
          title={`Arbitrate Order: ${selectedDispute.orderCode}`}
          description="Issue an official binding administrative decision for this trade dispute."
          className="max-w-lg"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
            {dialogError && <Alert tone="error" title={dialogError} />}

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
              <div><strong>Order:</strong> {selectedDispute.orderCode} (₦{selectedDispute.totalAmount.toLocaleString("en-NG")})</div>
              <div><strong>Farmer:</strong> {selectedDispute.farmer.fullName} ({selectedDispute.farmer.phoneNumber})</div>
              <div><strong>Buyer:</strong> {selectedDispute.buyer.fullName} ({selectedDispute.buyer.phoneNumber})</div>
            </div>

            <FormField label="Arbitration Outcome" htmlFor="arbitration-outcome">
              {({ id }) => (
                <Select
                  id={id}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as "RESOLVE_COMPLETED" | "RESOLVE_CANCELLED")}
                >
                  <option value="RESOLVE_COMPLETED">
                    Resolve &amp; Complete Order (Confirm produce accepted/retained)
                  </option>
                  <option value="RESOLVE_CANCELLED">
                    Resolve &amp; Cancel Order (Release parties &amp; restock inventory)
                  </option>
                </Select>
              )}
            </FormField>

            {outcome === "RESOLVE_CANCELLED" && (
              <label className="flex items-center gap-2 text-xs text-gray-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreInventory}
                  onChange={(e) => setRestoreInventory(e.target.checked)}
                  className="rounded border-gray-300 text-green-700 focus:ring-green-600 h-4 w-4"
                />
                <span>Restore produce inventory ({selectedDispute.quantity} {selectedDispute.unitCode}) back to farmer&apos;s listing</span>
              </label>
            )}

            <FormField label="Administrative Resolution Notes" htmlFor="resolution-notes" required>
              {({ id, describedBy, hasError }) => (
                <Textarea
                  id={id}
                  rows={4}
                  placeholder="Document the arbitration terms, settlement details, or inspection findings..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  aria-describedby={describedBy}
                  hasError={hasError}
                  required
                />
              )}
            </FormField>

            <div className="rounded-md bg-amber-50 p-2.5 text-[11px] text-amber-900 border border-amber-200">
              This arbitration will be recorded into the platform audit log and instant in-app alerts will be dispatched to the farmer, buyer, and carrier.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setSelectedDispute(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className={outcome === "RESOLVE_CANCELLED" ? "bg-red-700 hover:bg-red-800" : "bg-green-700 hover:bg-green-800"}
              >
                Confirm Resolution
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
