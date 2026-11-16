"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle,
  Truck,
  ShieldCheck,
  User,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  buttonClasses,
  Alert,
} from "@/components/ui";
import { ExchangeAgreementSummary } from "@/modules/barter/schemas.ts";
import { useAuth } from "@/components/auth/auth-provider.tsx";

interface BarterAgreementViewProps {
  agreement: ExchangeAgreementSummary;
}

export function BarterAgreementView({ agreement: initialAgreement }: BarterAgreementViewProps) {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<ExchangeAgreementSummary>(initialAgreement);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFarmerA = user?.id === agreement.farmerAId;
  const isFarmerB = user?.id === agreement.farmerBId;
  const isAdmin = user?.role === "ADMIN";
  const isParty = isFarmerA || isFarmerB || isAdmin;

  const hasMySideConfirmed =
    (isFarmerA && agreement.farmerAConfirmedAt !== null) ||
    (isFarmerB && agreement.farmerBConfirmedAt !== null);

  const isBothConfirmed = agreement.status === "COMPLETED";

  async function handleConfirmFulfillment() {
    if (!confirm("Confirm that you have physically exchanged/inspected the barter goods?")) {
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/barter/agreements/${agreement.id}/confirm`, {
        method: "POST",
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Failed to confirm barter fulfillment");
      }

      setAgreement(body.data);
      setSuccessMessage("Your fulfillment confirmation has been registered!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to confirm fulfillment");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/exchange/${agreement.listingId}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
            Barter Trade Agreement
          </h1>
          <p className="text-xs text-gray-600">
            Agreement ID: <code>{agreement.id.slice(-8)}</code> &bull; Listing: &quot;{agreement.listingTitle}&quot;
          </p>
        </div>
      </div>

      {error && (
        <Alert tone="error" title="Confirmation Notice">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert tone="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Completion Celebration Banner */}
      {isBothConfirmed && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-700 p-2 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-green-950">
                Barter Swap Fully Completed!
              </h2>
              <p className="text-xs text-green-800">
                Both parties have verified and confirmed physical delivery of their respective commodities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agreed Swap Terms Card */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100 bg-gray-50 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-green-700" />
              <CardTitle className="text-base text-gray-900">
                Agreed Barter Terms
              </CardTitle>
            </div>
            <Badge tone={agreement.status === "COMPLETED" ? "green" : "amber"}>
              {agreement.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg bg-green-50/60 border border-green-200/80 p-4 text-sm font-medium text-green-950">
            {agreement.termsSummary}
          </div>

          {/* Dual Parties Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Farmer A */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">
                Party A (Listing Owner)
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{agreement.farmerAName}</span>
              </div>
              <div className="text-xs text-gray-600">
                Phone: {agreement.farmerAPhone}
              </div>
              <div className="pt-2 text-xs">
                {agreement.farmerAConfirmedAt ? (
                  <span className="flex items-center gap-1 font-semibold text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Confirmed on {new Date(agreement.farmerAConfirmedAt).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Awaiting fulfillment confirmation</span>
                  </span>
                )}
              </div>
            </div>

            {/* Farmer B */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">
                Party B (Offer Proposer)
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{agreement.farmerBName}</span>
              </div>
              <div className="text-xs text-gray-600">
                Phone: {agreement.farmerBPhone}
              </div>
              <div className="pt-2 text-xs">
                {agreement.farmerBConfirmedAt ? (
                  <span className="flex items-center gap-1 font-semibold text-green-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Confirmed on {new Date(agreement.farmerBConfirmedAt).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Awaiting fulfillment confirmation</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dual Confirmation Action Box */}
          {isParty && !isBothConfirmed && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Dual Fulfillment Verification
                  </h3>
                  <p className="text-xs text-amber-800">
                    To prevent disputes, barter swaps require both farmers to independently confirm that the agreed crops were handed over and inspected in good condition.
                  </p>
                </div>
              </div>

              {!hasMySideConfirmed ? (
                <Button
                  variant="primary"
                  onClick={handleConfirmFulfillment}
                  disabled={confirming}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{confirming ? "Registering Confirmation..." : "Confirm I Have Delivered & Inspected My Produce"}</span>
                </Button>
              ) : (
                <div className="rounded-md bg-green-100 p-2.5 text-center text-xs font-semibold text-green-900">
                  ✓ You have confirmed your side. Waiting for your barter partner to confirm their delivery.
                </div>
              )}
            </div>
          )}

          {/* Section 19 Compliance & Logistics Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green-700" />
              <span>Direct farmer-to-farmer trade (No platform fund custody).</span>
            </div>

            <Link
              href="/transport"
              className={buttonClasses({
                variant: "secondary",
                className: "min-h-[44px] flex items-center gap-1.5 text-xs",
              })}
            >
              <Truck className="h-4 w-4 text-green-700" />
              <span>Need Haulage? Book a Transporter</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

