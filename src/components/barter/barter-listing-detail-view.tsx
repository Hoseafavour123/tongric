"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowLeftRight,
  MapPin,
  Check,
  Package,
  Layers,
  Send,
  User,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button,
  FormField,
  Input,
  Textarea,
  Select,
  Alert,
  Dialog,
} from "@/components/ui";
import { ExchangeListingSummary, ExchangeOfferSummary } from "@/modules/barter/schemas.ts";
import { PRODUCE_UNIT_CATALOG } from "@/modules/i18n/catalogs.ts";
import { useAuth } from "@/components/auth/auth-provider.tsx";

interface BarterListingDetailViewProps {
  listing: ExchangeListingSummary;
  offers: ExchangeOfferSummary[];
}

export function BarterListingDetailView({ listing, offers: initialOffers }: BarterListingDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [offers, setOffers] = useState<ExchangeOfferSummary[]>(initialOffers);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offeredItemDescription, setOfferedItemDescription] = useState("");
  const [offeredQty, setOfferedQty] = useState<number | "">("");
  const [offeredUnit, setOfferedUnit] = useState("bag");
  const [message, setMessage] = useState("");

  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === listing.ownerFarmerId;
  const isFarmer = user?.role === "FARMER" || user?.role === "ADMIN";

  async function handleProposeOffer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!offeredItemDescription.trim()) {
      setError("Please describe the produce or items you are offering in swap");
      return;
    }
    if (!offeredQty || Number(offeredQty) <= 0) {
      setError("Please enter a valid quantity greater than 0");
      return;
    }

    setSubmittingOffer(true);

    try {
      const res = await fetch(`/api/barter/listings/${listing.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeredItemDescription: offeredItemDescription.trim(),
          offeredQty: Number(offeredQty),
          offeredUnit,
          message: message.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Failed to propose barter offer");
      }

      setOffers((prev) => [body.data, ...prev]);
      setShowOfferDialog(false);
      setOfferedItemDescription("");
      setOfferedQty("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmittingOffer(false);
    }
  }

  async function handleAcceptOffer(offerId: string) {
    if (!confirm("Are you sure you want to accept this barter offer? This will establish an official agreement and decline other offers.")) {
      return;
    }

    setAcceptingOfferId(offerId);
    setError(null);

    try {
      const res = await fetch(`/api/barter/offers/${offerId}/accept`, {
        method: "POST",
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Failed to accept offer");
      }

      // Redirect to the agreement page
      router.push(`/exchange/agreements/${body.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept offer");
      setAcceptingOfferId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-2">
        <Link
          href="/exchange"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
            {listing.offeredTitle}
          </h1>
          <p className="text-xs text-gray-600">
            Barter Listing Reference: <code>{listing.id.slice(-8)}</code>
          </p>
        </div>
      </div>

      {error && (
        <Alert tone="error" title="Barter Notice">
          {error}
        </Alert>
      )}

      {/* Main Listing Comparison Card */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100 bg-gray-50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={listing.status === "OPEN" ? "green" : listing.status === "COMPLETED" ? "neutral" : "amber"}>
                {listing.status}
              </Badge>
              <Badge tone="neutral">{listing.offeredItemType}</Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{listing.locationLga} LGA, Benue</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* 2-Leg Swap Visual Comparison */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Offered */}
            <div className="rounded-xl border border-green-200 bg-green-50/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-green-900 uppercase">
                <Package className="h-4 w-4 text-green-700" />
                <span>Farmer Offers</span>
              </div>
              <div className="text-2xl font-extrabold text-green-950">
                {listing.offeredQty} {listing.offeredUnit}
              </div>
              <p className="text-sm text-gray-800">
                {listing.offeredDescription}
              </p>
            </div>

            {/* Desired */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                <Layers className="h-4 w-4 text-amber-700" />
                <span>Desired In Return</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-950">
                {listing.desiredQty ? `${listing.desiredQty} ${listing.desiredUnit ?? ""}` : "Open To Negotiation"}
              </div>
              <p className="text-sm text-gray-800">
                {listing.desiredDescription}
              </p>
            </div>
          </div>

          {/* Farmer Contact Info */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>
                Consignor: <strong>{listing.ownerFarmerName}</strong>
              </span>
            </div>
            <span>
              Phone: <strong>{listing.ownerFarmerPhone}</strong>
            </span>
          </div>

          {/* CTA for peer farmers */}
          {!isOwner && listing.status === "OPEN" && isFarmer && (
            <div className="pt-2">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-base font-bold text-gray-400 cursor-not-allowed"
              >
                <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                <span>Propose Swap Offer (Disabled)</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Received Swap Proposals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Submitted Swap Proposals ({offers.length})
          </h2>
          <span className="text-xs text-gray-500">
            {isOwner ? "Review and accept incoming barter offers" : "Offers proposed by market participants"}
          </span>
        </div>

        {offers.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No swap offers have been submitted for this listing yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id} className="border-gray-200 bg-white shadow-xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge tone={offer.status === "ACCEPTED" ? "green" : offer.status === "REJECTED" ? "red" : "amber"}>
                          {offer.status}
                        </Badge>
                        <span className="text-sm font-bold text-gray-900">
                          {offer.proposerFarmerName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-green-900">
                        Offering: {offer.offeredQty} {offer.offeredUnit} of {offer.offeredItemDescription}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {offer.message && (
                    <p className="text-xs italic text-gray-600 bg-gray-50 p-2.5 rounded-md">
                      &quot;{offer.message}&quot;
                    </p>
                  )}

                  {isOwner && listing.status === "OPEN" && offer.status === "PENDING" && (
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Button
                        variant="primary"
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={acceptingOfferId === offer.id}
                        className="min-h-[44px] flex items-center gap-2 text-sm font-bold"
                      >
                        <Check className="h-4 w-4" />
                        <span>{acceptingOfferId === offer.id ? "Accepting..." : "Accept Swap Offer"}</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Propose Swap Dialog */}
      <Dialog
        open={showOfferDialog}
        onClose={() => setShowOfferDialog(false)}
        title="Propose Barter Offer"
      >
        <form onSubmit={handleProposeOffer} className="space-y-4 pt-2">
          <p className="text-xs text-gray-600">
            State the exact produce, seeds, or tools you propose trading for {listing.offeredTitle}.
          </p>

          <FormField label="What Produce / Item Will You Trade?" required>
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                placeholder="e.g. Clean bags of yellow maize"
                value={offeredItemDescription}
                onChange={(e) => setOfferedItemDescription(e.target.value)}
                className="min-h-[44px] bg-white text-sm"
              />
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity" required>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="number"
                  min="1"
                  aria-describedby={describedBy}
                  placeholder="e.g. 5"
                  value={offeredQty}
                  onChange={(e) => setOfferedQty(e.target.value ? Number(e.target.value) : "")}
                  className="min-h-[44px] bg-white text-sm"
                />
              )}
            </FormField>

            <FormField label="Unit" required>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={offeredUnit}
                  onChange={(e) => setOfferedUnit(e.target.value)}
                  className="min-h-[44px] bg-white text-sm"
                >
                  {PRODUCE_UNIT_CATALOG.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.code}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>

          <FormField label="Message to Farmer (Optional)">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                rows={2}
                placeholder="e.g. My farm is also located in Guma, we can easily exchange at Gbajimba market."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white text-sm"
              />
            )}
          </FormField>

          <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
            <span>Zero platform custody. Both parties will coordinate physical exchange directly.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowOfferDialog(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submittingOffer}
              className="min-h-[44px] flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>{submittingOffer ? "Sending..." : "Submit Barter Proposal"}</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

