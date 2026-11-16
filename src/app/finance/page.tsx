import { Badge } from "@/components/ui";
import { FinanceHubView } from "@/components/finance/finance-hub-view";
import { DEFAULT_FINANCING_PRODUCTS } from "@/modules/finance/schemas";

export const dynamic = "force-dynamic";

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Agricultural Finance & Credit
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Accredited cooperative lending directory and agricultural credit facilities.
            </p>
          </div>
          <Badge tone="green">Cooperative Credit</Badge>
        </div>
      </div>

      {/* Extended Finance Hub & Cooperative Demonstration */}
      <FinanceHubView products={DEFAULT_FINANCING_PRODUCTS} hideHeader={true} />
    </div>
  );
}
