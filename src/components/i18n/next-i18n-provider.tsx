"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider, type I18nProviderProps } from "./i18n-provider";

export function NextI18nProvider(
  props: Omit<I18nProviderProps, "onLocalePersisted">,
) {
  const router = useRouter();
  const handlePersisted = useCallback(() => {
    router.refresh();
  }, [router]);

  return <I18nProvider {...props} onLocalePersisted={handlePersisted} />;
}

