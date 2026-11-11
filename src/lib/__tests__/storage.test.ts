import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";
import {
  createCloudinaryStorageProvider,
  type CloudinarySdkLike,
} from "../storage/cloudinary-storage-core";
import { createLocalStorageProvider } from "../storage/local-storage-core";
import {
  assertSafeStorageKey,
  detectMagicMimeType,
  MAX_PUBLIC_IMAGE_BYTES,
  validateUploadInput,
} from "../storage/validation";

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
]);
const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e]);

describe("storage validation", () => {
  it("detects valid JPEG, PNG, and PDF magic bytes", () => {
    expect(detectMagicMimeType(JPEG_BYTES)).toBe("image/jpeg");
    expect(detectMagicMimeType(PNG_BYTES)).toBe("image/png");
    expect(detectMagicMimeType(PDF_BYTES)).toBe("application/pdf");
  });

  it("rejects spoofed HTML/text payloads masquerading as JPEG", () => {
    const fake = new TextEncoder().encode("<script>alert(1)</script>");
    expect(() =>
      validateUploadInput({
        key: "listings/1/evil.jpg",
        buffer: fake,
        declaredMimeType: "image/jpeg",
        visibility: "public",
      }),
    ).toThrow(ValidationError);
  });

  it("blocks PDFs in public produce image uploads while allowing them in private docs", () => {
    expect(() =>
      validateUploadInput({
        key: "listings/1/doc.pdf",
        buffer: PDF_BYTES,
        declaredMimeType: "application/pdf",
        visibility: "public",
      }),
    ).toThrow(ValidationError);

    const validated = validateUploadInput({
      key: "kyc/driver/license.pdf",
      buffer: PDF_BYTES,
      declaredMimeType: "application/pdf",
      visibility: "private",
    });
    expect(validated.mimeType).toBe("application/pdf");
  });

  it("rejects oversized public images and path traversal keys", () => {
    const huge = new Uint8Array(MAX_PUBLIC_IMAGE_BYTES + 1);
    huge.set(JPEG_BYTES, 0);

    expect(() =>
      validateUploadInput({
        key: "listings/1/big.jpg",
        buffer: huge,
        declaredMimeType: "image/jpeg",
        visibility: "public",
      }),
    ).toThrow(/2MB/);

    expect(() => assertSafeStorageKey("../secret.png")).toThrow(ValidationError);
    expect(() => assertSafeStorageKey("/etc/passwd")).toThrow(ValidationError);
  });
});

describe("createCloudinaryStorageProvider", () => {
  it("uploads public photos as type upload and private docs as type private with expiring signed URLs", async () => {
    const uploadBuffer = vi.fn(async ({ publicId }) => ({
      public_id: publicId,
      secure_url: `https://res.cloudinary.com/demo/image/upload/${publicId}`,
    }));
    const getPublicUrl = vi.fn(
      (publicId: string) =>
        `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/${publicId}`,
    );
    const getPrivateSignedUrl = vi.fn(
      ({ publicId, expiresAtSeconds }) =>
        `https://api.cloudinary.com/v1_1/demo/download/${publicId}?expires_at=${expiresAtSeconds}`,
    );
    const destroy = vi.fn(async () => {});

    const sdk: CloudinarySdkLike = {
      uploadBuffer,
      getPublicUrl,
      getPrivateSignedUrl,
      destroy,
    };
    const provider = createCloudinaryStorageProvider(sdk);

    const publicObj = await provider.upload({
      key: "listings/l1/tomato.jpg",
      buffer: JPEG_BYTES,
      declaredMimeType: "image/jpeg",
      visibility: "public",
    });
    expect(uploadBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "tongric/public/listings/l1/tomato",
        visibility: "public",
        resourceType: "image",
      }),
    );
    expect(publicObj.publicUrl).toContain("f_auto,q_auto");

    const privateObj = await provider.upload({
      key: "kyc/u1/id-card.png",
      buffer: PNG_BYTES,
      declaredMimeType: "image/png",
      visibility: "private",
    });
    expect(privateObj.publicUrl).toBeNull();
    expect(privateObj.providerKey).toBe("tongric/private/kyc/u1/id-card");

    const signedUrl = await provider.getAccessUrl(privateObj.providerKey, {
      visibility: "private",
      mimeType: "image/png",
      expiresInSeconds: 9999, // clamped to <= 300s
    });
    expect(signedUrl).toContain("expires_at=");
    const callArgs = getPrivateSignedUrl.mock.calls[0]![0];
    const nowSeconds = Math.floor(Date.now() / 1000);
    expect(callArgs.expiresAtSeconds - nowSeconds).toBeLessThanOrEqual(301);
  });
});

describe("createLocalStorageProvider", () => {
  it("stores, resolves, reads, and deletes files in isolated temp directory", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tongric-store-"));
    try {
      const provider = createLocalStorageProvider(tempRoot);
      const uploaded = await provider.upload({
        key: "kyc/u1/doc.png",
        buffer: PNG_BYTES,
        declaredMimeType: "image/png",
        visibility: "private",
      });

      expect(uploaded.publicUrl).toBeNull();
      const access = await provider.getAccessUrl(uploaded.providerKey, {
        visibility: "private",
        mimeType: "image/png",
      });
      expect(access).toBe("local-signed://private/kyc/u1/doc.png");

      const content = await provider.readBuffer(uploaded.providerKey);
      expect(Uint8Array.from(content)).toEqual(PNG_BYTES);

      await provider.delete(uploaded.providerKey, "private", "image/png");
      await expect(
        provider.getAccessUrl(uploaded.providerKey, {
          visibility: "private",
          mimeType: "image/png",
        }),
      ).rejects.toThrow();
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });
});

