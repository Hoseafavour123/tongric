import "server-only";
import path from "node:path";
import { getEnv } from "@/lib/env";
import { isCloudinaryConfigured } from "@/lib/env-schema";
import { buildCloudinaryStorageProvider } from "./cloudinary-storage";
import { createLocalStorageProvider } from "./local-storage-core";
import type { StorageProvider } from "./types";

let cachedProvider: StorageProvider | null = null;
let warnedLocalFallback = false;

/**
 * Returns the active StorageProvider (Cloudinary when credentials exist in .env,
 * otherwise local non-public disk fallback under .tongric-local-storage/).
 */
export function getStorageProvider(): StorageProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const env = getEnv();
  if (
    isCloudinaryConfigured(env) &&
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    cachedProvider = buildCloudinaryStorageProvider({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    });
    return cachedProvider;
  }

  if (!warnedLocalFallback && env.NODE_ENV !== "test") {
    warnedLocalFallback = true;
    console.warn(
      "[Tongric Storage] Cloudinary credentials not set; using local disk fallback (.tongric-local-storage/).",
    );
  }

  cachedProvider = createLocalStorageProvider(
    path.join(process.cwd(), ".tongric-local-storage"),
  );
  return cachedProvider;
}

