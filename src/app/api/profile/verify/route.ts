import { handleApiError, ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { getStorageProvider } from "@/lib/storage";
import { requireAuth } from "@/modules/auth/guards";
import {
  getLatestVerificationDocument,
  submitVerificationDocument,
} from "@/modules/profile";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop.slice(0, 64);
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 64) : null;
}

export async function GET() {
  try {
    const session = await requireAuth();

    const document = await getLatestVerificationDocument(
      { id: session.user.id, role: session.user.role },
      session.user.id,
    );

    return ok({ document });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const formData = await request.formData().catch(() => {
      throw new ValidationError("Request must be valid multipart form data.");
    });

    const documentType = formData.get("documentType");
    const documentNumber = formData.get("documentNumber");
    const fileEntry = formData.get("file");

    if (!fileEntry || typeof fileEntry === "string") {
      throw new ValidationError("Please attach a document file to upload.");
    }

    const file = fileEntry as File;
    if (file.size === 0) {
      throw new ValidationError("The selected file is empty.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(
        "File size exceeds the 5 MB limit. Please upload a smaller image or PDF.",
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new ValidationError(
        "Invalid file format. Only JPG, PNG, WEBP, and PDF documents are supported.",
      );
    }

    const storage = getStorageProvider();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Sanitize extension and base filename cleanly to guarantee safe key pattern
    const rawExt = file.name.includes(".") ? file.name.split(".").pop() || "" : "";
    const cleanExt = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const rawBase = file.name.includes(".") ? file.name.slice(0, file.name.lastIndexOf(".")) : file.name;
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || "document";
    const safeName = cleanExt ? `${cleanBase}.${cleanExt}` : cleanBase;
    const storageKey = `kyc/${session.user.id}/${Date.now()}-${safeName}`;

    const stored = await storage.upload({
      key: storageKey,
      buffer,
      declaredMimeType: file.type,
      visibility: "private",
    });

    const ipAddress = extractClientIp(request);

    const document = await submitVerificationDocument(
      { id: session.user.id, role: session.user.role },
      session.user.id,
      {
        documentType,
        documentNumber: documentNumber ? String(documentNumber) : null,
      },
      {
        storagePath: stored.providerKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
      },
      { ipAddress },
    );

    return ok({ document });
  } catch (error) {
    return handleApiError(error);
  }
}
