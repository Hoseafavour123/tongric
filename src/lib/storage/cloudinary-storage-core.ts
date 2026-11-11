import {
  assertSafeStorageKey,
  clampPrivateUrlTtl,
  validateUploadInput,
} from "./validation";
import type {
  AllowedMimeType,
  GetAccessUrlOptions,
  StorageProvider,
  StorageVisibility,
  StoredObject,
  UploadFileInput,
} from "./types";

export interface CloudinarySdkLike {
  uploadBuffer(params: {
    buffer: Uint8Array;
    publicId: string;
    visibility: StorageVisibility;
    resourceType: "image" | "raw";
  }): Promise<{ public_id: string; secure_url: string }>;
  getPublicUrl(publicId: string): string;
  getPrivateSignedUrl(params: {
    publicId: string;
    format: string;
    resourceType: "image" | "raw";
    expiresAtSeconds: number;
  }): string;
  destroy(params: {
    publicId: string;
    visibility: StorageVisibility;
    resourceType: "image" | "raw";
  }): Promise<void>;
}

const MIME_TO_FORMAT: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function stripExtension(key: string): string {
  return key.replace(/\.[a-zA-Z0-9]{1,8}$/, "");
}

function toResourceType(mimeType: AllowedMimeType): "image" | "raw" {
  return mimeType === "application/pdf" ? "raw" : "image";
}

/**
 * Creates a Cloudinary-backed StorageProvider that strictly separates public
 * produce photos (type: "upload") from private KYC/loan docs (type: "private" + expiring signed URLs).
 */
export function createCloudinaryStorageProvider(
  sdk: CloudinarySdkLike,
): StorageProvider {
  return {
    providerName: "cloudinary",

    async upload(input: UploadFileInput): Promise<StoredObject> {
      const { safeKey, mimeType, sizeBytes } = validateUploadInput(input);
      const resourceType = toResourceType(mimeType);
      const baseKey =
        resourceType === "raw"
          ? `${stripExtension(safeKey)}.pdf`
          : stripExtension(safeKey);
      const publicId = `tongric/${input.visibility}/${baseKey}`;

      const uploaded = await sdk.uploadBuffer({
        buffer: input.buffer,
        publicId,
        visibility: input.visibility,
        resourceType,
      });

      const publicUrl =
        input.visibility === "public"
          ? sdk.getPublicUrl(uploaded.public_id)
          : null;

      return {
        key: safeKey,
        providerKey: uploaded.public_id,
        visibility: input.visibility,
        mimeType,
        sizeBytes,
        publicUrl,
      };
    },

    async getAccessUrl(
      providerKey: string,
      options: GetAccessUrlOptions,
    ): Promise<string> {
      const safeProviderKey = assertSafeStorageKey(providerKey);

      if (options.visibility === "public") {
        return sdk.getPublicUrl(safeProviderKey);
      }

      const ttl = clampPrivateUrlTtl(options.expiresInSeconds);
      const expiresAtSeconds = Math.floor(Date.now() / 1000) + ttl;

      return sdk.getPrivateSignedUrl({
        publicId: safeProviderKey,
        format: MIME_TO_FORMAT[options.mimeType],
        resourceType: toResourceType(options.mimeType),
        expiresAtSeconds,
      });
    },

    async delete(
      providerKey: string,
      visibility: StorageVisibility,
      mimeType: AllowedMimeType,
    ): Promise<void> {
      const safeProviderKey = assertSafeStorageKey(providerKey);
      await sdk.destroy({
        publicId: safeProviderKey,
        visibility,
        resourceType: toResourceType(mimeType),
      });
    },
  };
}

