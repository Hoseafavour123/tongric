import { requireRole } from "@/modules/auth/guards.ts";
import { listAllLoanApplications, getAllFinancingProducts } from "@/modules/finance";
import { AdminFinanceView } from "@/components/admin/admin-finance-view.tsx";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireRole(["ADMIN"]);

  const [applications, products] = await Promise.all([
    listAllLoanApplications(),
    getAllFinancingProducts(),
  ]);

  return <AdminFinanceView initialApplications={applications} products={products} />;
}

