import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/modules/auth/guards.ts";
import { getFinancingProductById, getFarmerCreditEligibility } from "@/modules/finance";
import { LoanApplyView } from "@/components/finance/loan-apply-view.tsx";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanApplyPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const product = await getFinancingProductById(id);
  if (!product) {
    notFound();
  }

  const eligibility = await getFarmerCreditEligibility(session.user.id);

  return <LoanApplyView product={product} eligibility={eligibility} />;
}

