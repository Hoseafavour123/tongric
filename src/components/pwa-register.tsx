"use client";

import { useEffect } from "react";

/**
 * Registers the lightweight Tongric service worker for PWA installability
 * without interfering with dynamic API requests or older mobile browsers.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Degrade silently on browsers with restricted service worker support.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}

