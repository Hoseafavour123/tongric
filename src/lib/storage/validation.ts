import { ValidationError } from "@/lib/errors";
import type {
  AllowedMimeType,
  StorageVisibility,
  UploadFileInput,
} from "./types";

export const MAX_PUBLIC_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_PRIVATE_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5 MB

export const PUBLIC_IMAGE_MIMES: readonly AllowedMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const PRIVATE_DOCUMENT_MIMES: readonly AllowedMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const SAFE_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,180}(\.[a-zA-Z0-9]{1,8})?$/;

/**
 * Ensures storage object keys cannot escape folders via path traversal or invalid characters.
 */
export function assertSafeStorageKey(key: string): string {
  const trimmed = key.trim();
  if (
    !trimmed ||
    trimmed.startsWith("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    trimmed.includes("//") ||
    !SAFE_KEY_PATTERN.test(trimmed)
  ) {
    throw new ValidationError("Invalid storage file key");
  }
  return trimmed;
}

/**
 * Detects true file format from binary magic bytes rather than trusting client MIME headers.
 */
export function detectMagicMimeType(buffer: Uint8Array): AllowedMimeType | null {
  if (buffer.byteLength < 4) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.byteLength >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF....WEBP
  if (
    buffer.byteLength >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // PDF: %PDF-
  if (
    buffer.byteLength >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "application/pdf";
  }

  return null;
}

export function getAllowedMimesForVisibility(
  visibility: StorageVisibility,
): readonly AllowedMimeType[] {
  return visibility === "public" ? PUBLIC_IMAGE_MIMES : PRIVATE_DOCUMENT_MIMES;
}

export function getMaxBytesForVisibility(visibility: StorageVisibility): number {
  return visibility === "public"
    ? MAX_PUBLIC_IMAGE_BYTES
    : MAX_PRIVATE_DOCUMENT_BYTES;
}

/**
 * Performs strict server-side validation of key, size, MIME allowlist, and magic bytes.
 */
export function validateUploadInput(input: UploadFileInput): {
  safeKey: string;
  mimeType: AllowedMimeType;
  sizeBytes: number;
} {
  const safeKey = assertSafeStorageKey(input.key);
  const sizeBytes = input.buffer.byteLength;

  if (sizeBytes === 0) {
    throw new ValidationError("Uploaded file cannot be empty");
  }

  const maxBytes = getMaxBytesForVisibility(input.visibility);
  if (sizeBytes > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new ValidationError(
      `File exceeds maximum allowed size of ${limitMb}MB`,
    );
  }

  const detectedMime = detectMagicMimeType(input.buffer);
  if (!detectedMime) {
    throw new ValidationError("Unsupported or corrupted file format");
  }

  const allowed = getAllowedMimesForVisibility(input.visibility);
  if (!allowed.includes(detectedMime)) {
    throw new ValidationError(
      input.visibility === "public"
        ? "Public listings only accept JPEG, PNG, or WebP images"
        : "Private documents only accept JPEG, PNG, WebP, or PDF files",
    );
  }

  const normalizedDeclared = input.declaredMimeType.trim().toLowerCase();
  if (normalizedDeclared && normalizedDeclared !== detectedMime) {
    throw new ValidationError(
      "File content does not match declared file type",
    );
  }

  return {
    safeKey,
    mimeType: detectedMime,
    sizeBytes,
  };
}

export function clampPrivateUrlTtl(seconds?: number): number {
  if (!seconds || !Number.isFinite(seconds)) {
    return 120;
  }
  return Math.min(Math.max(Math.floor(seconds), 30), 300);
}

