import { notFound } from "next/navigation";
import { BarterAgreementView } from "@/components/barter/barter-agreement-view.tsx";
import { getExchangeAgreement } from "@/modules/barter";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExchangeAgreementDetailPage({ params }: PageProps) {
  const { id } = await params;
  let agreement;
  try {
    agreement = await getExchangeAgreement(id);
  } catch {
    notFound();
  }

  if (!agreement) {
    notFound();
  }

  return <BarterAgreementView agreement={agreement} />;
}
