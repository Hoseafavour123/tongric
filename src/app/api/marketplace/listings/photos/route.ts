import { handleApiError, ok } from "@/lib/api-response";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { getStorageProvider } from "@/lib/storage";
import type { AllowedMimeType } from "@/lib/storage/types";
import { requireAuth } from "@/modules/auth/guards";

const ALLOWED_PHOTO_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
      throw new ForbiddenError(
        "Only registered farmers and administrators can upload produce photos.",
      );
    }

    const formData = await request.formData().catch(() => {
      throw new ValidationError("Request must be valid multipart form data.");
    });

    const fileEntry = formData.get("file");
    if (!fileEntry || typeof fileEntry === "string") {
      throw new ValidationError("Please attach an image file to upload.");
    }

    const file = fileEntry as File;
    if (file.size === 0) {
      throw new ValidationError("The selected image is empty.");
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      throw new ValidationError(
        "Image exceeds the 5 MB limit. Please select a smaller photo.",
      );
    }

    if (!ALLOWED_PHOTO_MIMES.has(file.type)) {
      throw new ValidationError(
        "Invalid image format. Only JPG, PNG, and WEBP photos are allowed.",
      );
    }

    const storage = getStorageProvider();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const rawExt = file.name.includes(".") ? file.name.split(".").pop() || "" : "";
    const cleanExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const rawBase = file.name.includes(".") ? file.name.slice(0, file.name.lastIndexOf(".")) : file.name;
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "photo";
    const safeName = cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
    const storageKey = `marketplace/${session.user.id}/${Date.now()}-${safeName}`;

    const stored = await storage.upload({
      key: storageKey,
      buffer,
      declaredMimeType: file.type,
      visibility: "public",
    });

    const publicUrl =
      stored.publicUrl ??
      (await storage.getAccessUrl(stored.providerKey, {
        visibility: "public",
        mimeType: stored.mimeType as AllowedMimeType,
      }));

    return ok(
      {
        photo: {
          fileStoragePath: stored.providerKey,
          publicUrl,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

