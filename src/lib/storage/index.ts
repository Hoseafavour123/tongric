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
  const localProvider = createLocalStorageProvider(
    path.join(process.cwd(), ".tongric-local-storage"),
  );

  if (
    isCloudinaryConfigured(env) &&
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    const cloudinaryProvider = buildCloudinaryStorageProvider({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    });

    cachedProvider = {
      providerName: "cloudinary",
      async upload(input) {
        try {
          return await cloudinaryProvider.upload(input);
        } catch (error) {
          console.warn(
            "[Tongric Storage] Cloudinary upload failed; falling back to secure local storage:",
            error,
          );
          return await localProvider.upload(input);
        }
      },
      async getAccessUrl(providerKey, options) {
        if (
          providerKey.startsWith("local/") ||
          providerKey.startsWith("private/") ||
          providerKey.startsWith("public/")
        ) {
          return localProvider.getAccessUrl(providerKey, options);
        }
        try {
          return await cloudinaryProvider.getAccessUrl(providerKey, options);
        } catch {
          return localProvider.getAccessUrl(providerKey, options);
        }
      },
      async delete(providerKey, visibility, mimeType) {
        if (
          providerKey.startsWith("local/") ||
          providerKey.startsWith("private/") ||
          providerKey.startsWith("public/")
        ) {
          return localProvider.delete(providerKey, visibility, mimeType);
        }
        try {
          return await cloudinaryProvider.delete(providerKey, visibility, mimeType);
        } catch {
          return localProvider.delete(providerKey, visibility, mimeType);
        }
      },
    };
    return cachedProvider;
  }

  if (!warnedLocalFallback && env.NODE_ENV !== "test") {
    warnedLocalFallback = true;
    console.warn(
      "[Tongric Storage] Cloudinary credentials not set; using local disk fallback (.tongric-local-storage/).",
    );
  }

  cachedProvider = localProvider;
  return cachedProvider;
}

