"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  MapPin,
  Calendar,
  Scale,
  Phone,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  Badge,
  Button,
  buttonClasses,
  Card,
  CardContent,
  Dialog,
  Alert,
} from "@/components/ui";
import type {
  TransportRequestSummary,
  TransporterAssignmentSummary,
  VerifiedTransporterSummary,
} from "@/modules/transport/schemas";
import type { TransportCorridor } from "@/modules/transport/corridors";

export interface TransportHubViewProps {
  corridors: readonly TransportCorridor[];
  openRequests: TransportRequestSummary[];
  myAssignments: TransporterAssignmentSummary[];
  verifiedTransporters: VerifiedTransporterSummary[];
  isTransporter: boolean;
  currentUserRole?: string;
  currentUserId?: string;
  initialTab?: "available" | "my-haulage" | "carriers";
}

export function TransportHubView({
  corridors: _corridors,
  openRequests: initialRequests,
  myAssignments: initialAssignments,
  verifiedTransporters,
  isTransporter,
  initialTab,
}: TransportHubViewProps) {
  void _corridors;
  const router = useRouter();

  const [openRequests, setOpenRequests] = useState<TransportRequestSummary[]>(initialRequests);
  const [myAssignments, setMyAssignments] = useState<TransporterAssignmentSummary[]>(initialAssignments);
  const [activeTab, setActiveTab] = useState<"available" | "my-haulage" | "carriers">(
    (initialTab as string) === "corridors"
      ? "carriers"
      : initialTab || (isTransporter ? "available" : "carriers"),
  );

  // Claim modal state
  const [selectedRequest, setSelectedRequest] = useState<TransportRequestSummary | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter carrier by LGA state & sort by capacity
  const [selectedLgaFilter, setSelectedLgaFilter] = useState<string>("ALL");
  const [capacitySort, setCapacitySort] = useState<"none" | "desc" | "asc">("none");

  const filteredTransporters =
    selectedLgaFilter === "ALL"
      ? verifiedTransporters
      : verifiedTransporters.filter((t) => t.operatingLgas.includes(selectedLgaFilter));

  const sortedTransporters = [...filteredTransporters].sort((a, b) => {
    if (capacitySort === "desc") {
      return b.maxCapacityKg - a.maxCapacityKg;
    }
    if (capacitySort === "asc") {
      return a.maxCapacityKg - b.maxCapacityKg;
    }
    return 0;
  });

  async function handleConfirmClaim() {
    if (!selectedRequest) return;

    setIsClaiming(true);
    setClaimError(null);

    try {
      const response = await fetch(`/api/transport/orders/${selectedRequest.id}/claim`, {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to claim transport haulage");
      }

      // Move from openRequests to myAssignments
      setOpenRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      setMyAssignments((prev) => [data.data.assignment, ...prev]);

      setSuccessBanner(
        `Haulage load ${selectedRequest.orderCode} claimed successfully! Route assigned: ${data.data.assignment.corridorRoute}.`,
      );
      setSelectedRequest(null);
      router.refresh();
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : "Error claiming haulage");
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Status Alerts */}
      {claimError && (
        <Alert tone="error" title="Claim Failed">
          <p className="text-xs text-red-800">{claimError}</p>
        </Alert>
      )}

      {successBanner && (
        <Alert tone="success" title="Assignment Confirmed">
          <p className="text-xs text-green-800">{successBanner}</p>
        </Alert>
      )}

      {/* Role-specific Action Banner */}
      {isTransporter ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-800 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-green-950">Transporter Fleet Hub</h1>
                  <p className="text-xs text-green-800">
                    Claim open cargo requests and coordinate farm-gate produce deliveries across Benue.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="green" className="text-xs">
                  Verified Carrier
                </Badge>
                <Link
                  href="/profile/transporter"
                  className={buttonClasses({
                    variant: "primary",
                    className: "min-h-[36px] px-3 text-xs inline-flex items-center gap-1.5",
                  })}
                >
                  <span>Vehicle &amp; LGAs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-800 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900">
                  Agricultural Logistics &amp; Transport
                </h1>
                <p className="text-xs text-gray-600">
                  Find verified transport carriers for farm-gate produce pickup and delivery across Benue State.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {isTransporter && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={`min-h-[44px] px-4 py-2 text-sm font-extrabold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "available"
                  ? "border-green-700 text-green-800"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Open Cargo Requests ({openRequests.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("my-haulage")}
              className={`min-h-[44px] px-4 py-2 text-sm font-extrabold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "my-haulage"
                  ? "border-green-700 text-green-800"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              My Active Haulage ({myAssignments.length})
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("carriers")}
          className={`min-h-[44px] px-4 py-2 text-sm font-extrabold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "carriers"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Verified Carriers ({verifiedTransporters.length})
        </button>
      </div>

      {/* Tab 1: Open Cargo Requests (Transporter Load Board) */}
      {activeTab === "available" && isTransporter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900">
              Open Cargo Load Board
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              {openRequests.length} available
            </span>
          </div>

          {openRequests.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <PackageCheck className="h-10 w-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-800">No Open Cargo Requests Right Now</p>
              <p className="text-xs text-gray-500">
                When buyers or farmers initiate orders requesting Tongric Logistics, they will appear
                here for instant claiming.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openRequests.map((req) => (
                <Card key={req.id} className="border border-gray-200 bg-white hover:border-green-300 transition-colors">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                          {req.orderCode}
                        </span>
                        <h3 className="text-base font-extrabold text-gray-900 mt-1 capitalize">
                          {req.cropCode} Produce Lot
                        </h3>
                        <p className="text-xs text-gray-500">
                          {req.quantity} {req.unitCode}s
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-500 block uppercase font-semibold">
                          Estimated Weight
                        </span>
                        <span className="text-sm font-extrabold text-gray-900 flex items-center justify-end gap-1">
                          <Scale className="h-3.5 w-3.5 text-gray-400" />
                          <span>~{req.estimatedWeightKg.toLocaleString("en-US")} kg</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-green-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900">Pickup:</span>{" "}
                          <span>
                            {req.listingLga} LGA{req.listingCommunity ? `, ${req.listingCommunity}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900">Dropoff:</span>{" "}
                          <span>{req.destinationLocation || "Central Benue Destination"}</span>
                        </div>
                      </div>

                      {req.proposedCollectionDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>Collection Target: {req.proposedCollectionDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/orders/${req.id}`}
                        className="text-xs text-green-800 font-semibold hover:underline min-h-[44px] flex items-center"
                      >
                        View Order Details
                      </Link>

                      <Button
                        variant="primary"
                        onClick={() => setSelectedRequest(req)}
                        className="min-h-[44px] px-4"
                      >
                        Claim Haulage Load
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Active Haulage (Transporter Assigned Loads) */}
      {activeTab === "my-haulage" && isTransporter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900">
              My Active Haulage Assignments
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              {myAssignments.length} active
            </span>
          </div>

          {myAssignments.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <Truck className="h-10 w-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-800">No Active Haulage Assignments</p>
              <p className="text-xs text-gray-500">
                You have not claimed any cargo requests yet. Browse open loads to accept assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAssignments.map((assignment) => (
                <Card key={assignment.id} className="border border-green-200 bg-white">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-green-100 text-green-900 px-2 py-0.5 rounded">
                          {assignment.orderCode}
                        </span>
                        <Badge tone="green" className="text-xs font-bold">
                          {assignment.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {assignment.corridorRoute || "Corridor Haulage"}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {assignment.quantity} {assignment.unitCode}s (~{assignment.estimatedWeightKg} kg)
                        • From {assignment.listingLga} to {assignment.destinationLocation || "Destination"}
                      </p>
                      {assignment.farmerPhone && (
                        <p className="text-xs text-gray-500">
                          Farmer contact: {assignment.farmerName} ({assignment.farmerPhone})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {assignment.farmerPhone && (
                        <a
                          href={`tel:${assignment.farmerPhone}`}
                          className={buttonClasses({
                            variant: "ghost",
                            className: "min-h-[44px] px-3 border-gray-300 text-gray-700",
                          })}
                        >
                          <Phone className="h-4 w-4" />
                          <span className="sr-only">Call Farmer</span>
                        </a>
                      )}
                      <Link
                        href={`/orders/${assignment.id}`}
                        className={buttonClasses({
                          variant: "primary",
                          className: "min-h-[44px] px-4",
                        })}
                      >
                        Manage Delivery
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Verified Carriers Directory */}
      {activeTab === "carriers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                Verified Carrier Fleet Directory
              </h2>
              <p className="text-xs text-gray-500">
                Registered transport providers with verified commercial carrying capacity in Benue.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="carrier-lga-filter" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Filter LGA:
                </label>
                <select
                  id="carrier-lga-filter"
                  value={selectedLgaFilter}
                  onChange={(e) => setSelectedLgaFilter(e.target.value)}
                  className="min-h-[44px] px-3 text-xs rounded border border-gray-300 bg-white font-semibold text-gray-800"
                >
                  <option value="ALL">All Benue LGAs</option>
                  <option value="Gboko">Gboko</option>
                  <option value="Makurdi">Makurdi</option>
                  <option value="Otukpo">Otukpo</option>
                  <option value="Katsina-Ala">Katsina-Ala</option>
                  <option value="Ukum">Ukum (Zaki Biam)</option>
                  <option value="Vandeikya">Vandeikya</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="carrier-capacity-sort" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Sort Capacity:
                </label>
                <select
                  id="carrier-capacity-sort"
                  value={capacitySort}
                  onChange={(e) => setCapacitySort(e.target.value as "none" | "desc" | "asc")}
                  className="min-h-[44px] px-3 text-xs rounded border border-gray-300 bg-white font-semibold text-gray-800"
                >
                  <option value="none">Default Order</option>
                  <option value="desc">Highest Capacity (Tonnes)</option>
                  <option value="asc">Lowest Capacity (Tonnes)</option>
                </select>
              </div>
            </div>
          </div>

          {sortedTransporters.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <Truck className="h-10 w-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-800">No Carriers Found For This LGA</p>
              <p className="text-xs text-gray-500">
                Switch LGA filter to view available transport operators across Benue State.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTransporters.map((carrier) => (
                <Card key={carrier.id} className="border border-gray-200 bg-white overflow-hidden hover:border-green-300 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    {/* Carrier Vehicle Image */}
                    <div className="relative h-44 w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/transport/carrier-truck.jpg"
                        alt={`${carrier.operatorName} vehicle`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          tone={carrier.verificationStatus === "VERIFIED" ? "green" : "neutral"}
                          className="text-xs shadow-xs"
                        >
                          {carrier.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900">
                          {carrier.operatorName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {carrier.averageRating !== null && carrier.reviewCount > 0 ? (
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                              <span>{carrier.averageRating.toFixed(1)}</span>
                              <span className="text-gray-500 font-normal">
                                ({carrier.reviewCount} {carrier.reviewCount === 1 ? "review" : "reviews"})
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                              <Star className="h-3 w-3 text-gray-400" />
                              <span>New Carrier • No reviews yet</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prominent Phone Number Display */}
                    <div className="flex items-center gap-2 rounded-md bg-green-50/80 border border-green-200 px-3 py-1.5 text-xs text-green-950 font-bold w-fit">
                      <Phone className="h-3.5 w-3.5 text-green-700 shrink-0" />
                      <span>Phone: <strong className="font-mono text-sm text-green-900">{carrier.phoneNumber}</strong></span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-900">Max Capacity:</span>{" "}
                        ~{carrier.maxCapacityKg.toLocaleString("en-US")} kg
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Operating LGAs:</span>{" "}
                        {carrier.operatingLgas.join(", ")}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Fleet Vehicles:</span>{" "}
                        {carrier.vehicleTypes.join(", ").replace(/_/g, " ")}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Ready for dispatch</span>
                      </span>

                      <a
                        href={`tel:${carrier.phoneNumber}`}
                        className={buttonClasses({
                          variant: "primary",
                          className: "min-h-[44px] px-4 inline-flex items-center gap-2 font-bold",
                        })}
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call Carrier</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claim Confirmation Dialog */}
      {selectedRequest && (
        <Dialog
          open={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title="Confirm Haulage Route Claim"
          description="By claiming this load, you accept responsibility for produce pickup from the farmer and delivery to the buyer."
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-green-950 space-y-1.5">
              <p>
                <strong>Order Code:</strong> {selectedRequest.orderCode}
              </p>
              <p>
                <strong>Cargo:</strong> {selectedRequest.quantity} {selectedRequest.unitCode}s of{" "}
                {selectedRequest.cropCode} (~{selectedRequest.estimatedWeightKg} kg)
              </p>
              <p>
                <strong>Pickup Location:</strong> {selectedRequest.listingLga} LGA
                {selectedRequest.listingCommunity ? `, ${selectedRequest.listingCommunity}` : ""}
              </p>
              <p>
                <strong>Destination:</strong> {selectedRequest.destinationLocation || "Agreed Dropoff Point"}
              </p>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Direct settlement framework: freight fees are agreed directly with the cargo owner and
              verified upon delivery inspection. Tongric operates zero platform fund custody.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedRequest(null)}
                disabled={isClaiming}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmClaim}
                disabled={isClaiming}
              >
                {isClaiming ? "Assigning..." : "Confirm & Claim Load"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

