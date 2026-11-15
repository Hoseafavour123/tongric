export const DEFAULT_MAX_COMPRESSED_BYTES = 200 * 1024; // 200 KB
export const DEFAULT_MAX_DIMENSION_PX = 1280;

export const SUPPORTED_COMPRESSIBLE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface ScaledDimensions {
  width: number;
  height: number;
  resized: boolean;
}

/**
 * Scales width/height proportionally so neither edge exceeds maxDimension
 * without upscaling already-small images.
 */
export function calculateScaledDimensions(
  width: number,
  height: number,
  maxDimension = DEFAULT_MAX_DIMENSION_PX,
): ScaledDimensions {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("Image dimensions must be positive numbers");
  }

  if (width <= maxDimension && height <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height), resized: false };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    resized: true,
  };
}

export interface CanvasRasterizer {
  loadDimensions(file: File): Promise<{ width: number; height: number; release(): void }>;
  encodeToBlob(
    width: number,
    height: number,
    mimeType: string,
    quality: number,
  ): Promise<Blob | null>;
}

export interface CompressImageOptions {
  maxBytes?: number;
  maxDimension?: number;
  rasterizer?: CanvasRasterizer;
}

export interface CompressedImageResult {
  file: File;
  compressed: boolean;
  originalBytes: number;
  finalBytes: number;
  mimeType: string;
}

function createBrowserRasterizer(file: File): CanvasRasterizer | null {
  if (typeof document === "undefined") {
    return null;
  }

  let bitmap: ImageBitmap | null = null;
  let imgElement: HTMLImageElement | null = null;
  let objectUrl: string | null = null;

  return {
    async loadDimensions() {
      if (typeof createImageBitmap === "function") {
        bitmap = await createImageBitmap(file);
        return {
          width: bitmap.width,
          height: bitmap.height,
          release: () => {
            bitmap?.close();
            bitmap = null;
          },
        };
      }

      if (typeof URL === "undefined" || typeof Image === "undefined") {
        throw new Error("Image decoding unavailable");
      }

      objectUrl = URL.createObjectURL(file);
      imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not decode image"));
        img.src = objectUrl!;
      });

      return {
        width: imgElement.naturalWidth,
        height: imgElement.naturalHeight,
        release: () => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
          }
          imgElement = null;
        },
      };
    },

    async encodeToBlob(width, height, mimeType, quality) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, width, height);
      } else if (imgElement) {
        ctx.drawImage(imgElement, 0, 0, width, height);
      } else {
        return null;
      }

      return new Promise<Blob | null>((resolve) => {
        if (typeof canvas.toBlob !== "function") {
          resolve(null);
          return;
        }
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
      });
    },
  };
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base || "produce"}.${ext}`;
}

/**
 * Compresses JPEG/PNG/WebP photos client-side for low-bandwidth Nigerian networks
 * targeting <= 200KB and <= 1280px max edge, degrading gracefully on older devices.
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<CompressedImageResult> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_COMPRESSED_BYTES;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION_PX;
  const normalizedType = file.type.trim().toLowerCase();

  if (!SUPPORTED_COMPRESSIBLE_MIMES.has(normalizedType)) {
    throw new Error("Only JPEG, PNG, or WebP images can be uploaded");
  }

  const rasterizer = options.rasterizer ?? createBrowserRasterizer(file);
  if (!rasterizer) {
    return {
      file,
      compressed: false,
      originalBytes: file.size,
      finalBytes: file.size,
      mimeType: normalizedType,
    };
  }

  let loaded: { width: number; height: number; release(): void } | null = null;
  try {
    loaded = await rasterizer.loadDimensions(file);
    const scaled = calculateScaledDimensions(
      loaded.width,
      loaded.height,
      maxDimension,
    );

    // Avoid unnecessary re-encoding when the photo is already lightweight and compact.
    if (file.size <= maxBytes && !scaled.resized) {
      return {
        file,
        compressed: false,
        originalBytes: file.size,
        finalBytes: file.size,
        mimeType: normalizedType,
      };
    }

    const candidateMimes = [
      { mime: "image/webp", ext: "webp" },
      { mime: "image/jpeg", ext: "jpg" },
    ];
    const qualities = [0.82, 0.72, 0.6, 0.48];
    let bestBlob: { blob: Blob; ext: string; mime: string } | null = null;

    for (const candidate of candidateMimes) {
      for (const quality of qualities) {
        const blob = await rasterizer.encodeToBlob(
          scaled.width,
          scaled.height,
          candidate.mime,
          quality,
        );
        if (!blob || blob.size === 0) {
          continue;
        }
        if (!bestBlob || blob.size < bestBlob.blob.size) {
          bestBlob = { blob, ext: candidate.ext, mime: blob.type || candidate.mime };
        }
        if (blob.size <= maxBytes) {
          const outFile = new File(
            [blob],
            replaceExtension(file.name, candidate.ext),
            { type: blob.type || candidate.mime },
          );
          return {
            file: outFile,
            compressed: true,
            originalBytes: file.size,
            finalBytes: outFile.size,
            mimeType: outFile.type,
          };
        }
      }
    }

    if (bestBlob && bestBlob.blob.size < file.size) {
      const outFile = new File(
        [bestBlob.blob],
        replaceExtension(file.name, bestBlob.ext),
        { type: bestBlob.mime },
      );
      return {
        file: outFile,
        compressed: true,
        originalBytes: file.size,
        finalBytes: outFile.size,
        mimeType: outFile.type,
      };
    }

    return {
      file,
      compressed: false,
      originalBytes: file.size,
      finalBytes: file.size,
      mimeType: normalizedType,
    };
  } catch {
    return {
      file,
      compressed: false,
      originalBytes: file.size,
      finalBytes: file.size,
      mimeType: normalizedType,
    };
  } finally {
    loaded?.release();
  }
}

