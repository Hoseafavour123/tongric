"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/cn";

export const LOW_DATA_STORAGE_KEY = "tongric_low_data_mode";
const LOW_DATA_EVENT = "tongric:low-data-change";

function subscribeLowData(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOW_DATA_STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOW_DATA_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOW_DATA_EVENT, callback);
  };
}

function getClientSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(LOW_DATA_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

interface LowDataContextValue {
  lowDataEnabled: boolean;
  setLowDataEnabled: (enabled: boolean) => void;
  toggleLowDataMode: () => void;
}

const LowDataContext = createContext<LowDataContextValue>({
  lowDataEnabled: false,
  setLowDataEnabled: () => {},
  toggleLowDataMode: () => {},
});

export function LowDataProvider({ children }: { children: ReactNode }) {
  const lowDataEnabled = useSyncExternalStore(
    subscribeLowData,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setLowDataEnabled = useCallback((enabled: boolean) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          LOW_DATA_STORAGE_KEY,
          enabled ? "true" : "false",
        );
      } catch {
        // Ignore storage errors cleanly.
      }
      window.dispatchEvent(new Event(LOW_DATA_EVENT));
    }
  }, []);

  const toggleLowDataMode = useCallback(() => {
    setLowDataEnabled(!getClientSnapshot());
  }, [setLowDataEnabled]);

  return (
    <LowDataContext.Provider
      value={{ lowDataEnabled, setLowDataEnabled, toggleLowDataMode }}
    >
      {children}
    </LowDataContext.Provider>
  );
}

export function useLowDataMode(): LowDataContextValue {
  return useContext(LowDataContext);
}

export function LowDataSwitch({ className }: { className?: string }) {
  const { lowDataEnabled, setLowDataEnabled } = useLowDataMode();
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {t("lowData.label")}
        </p>
        <p className="text-xs text-gray-600">{t("lowData.description")}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={lowDataEnabled}
        aria-label={t("lowData.label")}
        onClick={() => setLowDataEnabled(!lowDataEnabled)}
        className={cn(
          "inline-flex min-h-11 min-w-16 shrink-0 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors cursor-pointer",
          lowDataEnabled
            ? "border-green-700 bg-green-700 text-white"
            : "border-gray-300 bg-white text-gray-800 hover:bg-gray-100",
        )}
      >
        {lowDataEnabled ? t("lowData.on") : t("lowData.off")}
      </button>
    </div>
  );
}

