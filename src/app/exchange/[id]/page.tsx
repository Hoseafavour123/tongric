import { notFound } from "next/navigation";
import { BarterListingDetailView } from "@/components/barter/barter-listing-detail-view.tsx";
import { getExchangeListing } from "@/modules/barter";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExchangeListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  let data;
  try {
    data = await getExchangeListing(id);
  } catch {
    notFound();
  }

  if (!data?.listing) {
    notFound();
  }

  return <BarterListingDetailView listing={data.listing} offers={data.offers} />;
}
