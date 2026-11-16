import { BarterFeedView } from "@/components/barter/barter-feed-view.tsx";
import { listExchangeListings } from "@/modules/barter";

export const dynamic = "force-dynamic";

export default async function ExchangePage() {
  const listings = await listExchangeListings({});
  return <BarterFeedView initialListings={listings} />;
}

