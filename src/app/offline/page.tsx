import { WifiOff } from "lucide-react";
import { OfflineRetryButton } from "@/components/layout/offline-retry-button";
import { EmptyState } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <EmptyState
        icon={<WifiOff className="h-5 w-5" aria-hidden="true" />}
        title="You are currently offline"
        description="Tongric needs an active internet connection to load live produce stock, offers, and delivery updates. Turn on mobile data or Wi-Fi and tap Try Again."
        action={<OfflineRetryButton />}
      />
    </div>
  );
}

