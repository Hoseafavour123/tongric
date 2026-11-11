export type StorageVisibility = "public" | "private";

export type AllowedMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

export interface UploadFileInput {
  /** Logical relative key without leading slash or .. segments, e.g. "listings/abc/tomato.webp" */
  key: string;
  buffer: Uint8Array;
  declaredMimeType: string;
  visibility: StorageVisibility;
}

export interface StoredObject {
  key: string;
  providerKey: string;
  visibility: StorageVisibility;
  mimeType: AllowedMimeType;
  sizeBytes: number;
  /** Populated immediately for public media; always null for private documents. */
  publicUrl: string | null;
}

export interface GetAccessUrlOptions {
  visibility: StorageVisibility;
  mimeType: AllowedMimeType;
  /** Short-lived TTL for private documents (defaults to 120s, max 300s). */
  expiresInSeconds?: number;
}

export interface StorageProvider {
  readonly providerName: "cloudinary" | "local";
  upload(input: UploadFileInput): Promise<StoredObject>;
  getAccessUrl(providerKey: string, options: GetAccessUrlOptions): Promise<string>;
  delete(
    providerKey: string,
    visibility: StorageVisibility,
    mimeType: AllowedMimeType,
  ): Promise<void>;
}

