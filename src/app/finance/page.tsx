import Link from "next/link";
import { ShieldAlert, ArrowRight, ClipboardCheck, ArrowLeftRight, Coins } from "lucide-react";
import { Badge, buttonClasses, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Agricultural Finance & Settlement
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Transparent payment arrangements, barter exchange demonstration, and transaction history.
            </p>
          </div>
          <Badge tone="green">Section 19 Compliant</Badge>
        </div>
      </div>

      {/* Section 19 Zero-Custody Policy Disclosure */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-700" />
            <CardTitle className="text-lg text-amber-950">
              Direct Settlement Notice (No Platform Custody)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-sm text-amber-900">
          <p>
            In accordance with regulatory guidelines and Tongric Release 1 specifications (Section 19), <strong>Tongric does not hold, escrow, or custody commercial funds</strong>.
          </p>
          <p>
            All produce purchases and transport fees are settled directly between the Buyer and the Farmer (or Transporter) via direct Nigerian bank transfer or payment upon inspection.
          </p>
          <div className="pt-2">
            <Link
              href="/orders"
              className={buttonClasses({
                variant: "primary",
                className: "min-h-[44px] flex items-center justify-center gap-2",
              })}
            >
              <span>View My Orders & Invoices</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Phase 9 Extended Financial Demonstration Pilots */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-green-700" />
              <CardTitle className="text-base text-gray-900">Produce Barter Exchange</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs text-gray-600">
            <p>
              Enables farmers to trade surplus staple crops (e.g. yam tubers) for grain inputs (maize, rice, soybeans) without cash constraints in rural communities.
            </p>
            <Badge tone="neutral" className="mt-2">Pilot Feature (Phase 9)</Badge>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-700" />
              <CardTitle className="text-base text-gray-900">Input Micro-Credit Demonstration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs text-gray-600">
            <p>
              Allows smallholder farmers with verified sales history on Tongric to demonstrate creditworthiness for seasonal fertilizer and seed inputs.
            </p>
            <Badge tone="neutral" className="mt-2">Demonstration Only (Phase 9)</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Records Card */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-700" />
            <CardTitle className="text-base text-gray-900">Digital Trade History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-sm text-gray-600">
          <p>
            Every confirmed offer and order on Tongric generates an immutable Crockford-safe record (e.g. <code>ORD-202611-XXXXX</code>) detailing quantities, agreed prices, and collection milestones.
          </p>
          <Link
            href="/orders"
            className={buttonClasses({ variant: "secondary", className: "min-h-[44px]" })}
          >
            Review Completed Transactions
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
