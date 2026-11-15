"use client";

import { WifiOff } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { OfflineRetryButton } from "@/components/layout/offline-retry-button";
import { EmptyState } from "@/components/ui";

export default function OfflinePage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-lg py-8">
      <EmptyState
        icon={<WifiOff className="h-5 w-5" aria-hidden="true" />}
        title={t("offline.pageTitle")}
        description={t("offline.pageBody")}
        action={<OfflineRetryButton />}
      />
    </div>
  );
}
