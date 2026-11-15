"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert } from "@/components/ui";

type NetworkState = "online" | "offline" | "reconnected";

let currentState: NetworkState = "online";
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(callback);
    };
  }

  const handleOffline = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    currentState = "offline";
    notifyListeners();
  };

  const handleOnline = () => {
    if (currentState === "offline") {
      currentState = "reconnected";
      notifyListeners();
      reconnectTimer = setTimeout(() => {
        currentState = "online";
        reconnectTimer = null;
        notifyListeners();
      }, 4000);
    } else {
      currentState = "online";
      notifyListeners();
    }
  };

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    currentState = "offline";
  }

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  };
}

function getSnapshot(): NetworkState {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "offline";
  }
  return currentState;
}

function getServerSnapshot(): NetworkState {
  return "online";
}

export interface NetworkStatusBannerProps {
  forcedState?: NetworkState;
}

/**
 * Displays a clear localized banner whenever rural connectivity drops or recovers.
 */
export function NetworkStatusBanner({
  forcedState,
}: NetworkStatusBannerProps = {}) {
  const { t } = useI18n();
  const liveState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const state = forcedState ?? liveState;

  if (state === "online") {
    return null;
  }

  if (state === "offline") {
    return (
      <div className="mb-4">
        <Alert tone="warning" title={t("offline.bannerOfflineTitle")}>
          {t("offline.bannerOfflineBody")}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Alert tone="success" title={t("offline.bannerOnlineTitle")}>
        {t("offline.bannerOnlineBody")}
      </Alert>
    </div>
  );
}
