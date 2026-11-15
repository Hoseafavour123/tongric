import Link from "next/link";
import { Truck, ShieldCheck, MapPin, ArrowRight, UserCheck } from "lucide-react";
import { Badge, buttonClasses, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getServerSession } from "@/modules/auth/guards";

export const dynamic = "force-dynamic";

export default async function TransportPage() {
  const session = await getServerSession();
  const isTransporter = session?.user.role === "TRANSPORT_PROVIDER" || session?.user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Agricultural Logistics & Transport
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Coordinated farm-gate produce pickup and delivery across Benue State agricultural corridors.
            </p>
          </div>
          <Badge tone="green">Phase 7 Integration</Badge>
        </div>
      </div>

      {/* Role-specific Action Banner */}
      {isTransporter ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-green-700" />
              <CardTitle className="text-lg text-green-950">Transporter Fleet Hub</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-green-900">
              You are registered as a transport provider. Keep your vehicle capacity, operating LGAs, and availability status up to date to receive commercial haulage requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/profile/transporter"
                className={buttonClasses({ variant: "primary", className: "min-h-[44px] flex items-center justify-center gap-2" })}
              >
                <span>Manage Fleet & Routes</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/profile/verify"
                className={buttonClasses({ variant: "secondary", className: "min-h-[44px] flex items-center justify-center gap-2" })}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Submit Vehicle Verification</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-green-700" />
              <CardTitle className="text-lg text-gray-900">Fulfillment & Logistics Coordination</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-gray-600">
              When negotiating produce purchase offers, select <strong>Tongric Logistics Request</strong> to have verified local transporters matched to your collection LGA and delivery destination.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/market"
                className={buttonClasses({ variant: "primary", className: "min-h-[44px] flex items-center justify-center gap-2" })}
              >
                <span>Browse Produce Market</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/orders"
                className={buttonClasses({ variant: "secondary", className: "min-h-[44px] flex items-center justify-center gap-2" })}
              >
                <span>View My Orders</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benue Corridor Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800">
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold text-sm">23 Benue LGAs</h3>
            </div>
            <p className="text-xs text-gray-600">
              Covering major hubs: Makurdi, Gboko, Otukpo, Katsina-Ala, Vandeikya, and rural farm-gate collection points.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Documented Drivers</h3>
            </div>
            <p className="text-xs text-gray-600">
              Vehicle registration and driver license documents verified before commercial consignment handover.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800">
              <UserCheck className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Direct Rate Cards</h3>
            </div>
            <p className="text-xs text-gray-600">
              Transporters quote transparent per-kg and per-bag rates based on distance and vehicle type.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

