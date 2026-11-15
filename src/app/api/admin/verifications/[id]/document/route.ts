import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import { getVerificationDocumentById } from "@/modules/profile";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const doc = await getVerificationDocumentById(
      { id: session.user.id, role: session.user.role },
      id,
    );

    if (!doc) {
      throw new NotFoundError("Verification document not found.");
    }

    // If fileStoragePath is already an HTTP URL, redirect directly
    if (doc.fileStoragePath.startsWith("http://") || doc.fileStoragePath.startsWith("https://")) {
      return NextResponse.redirect(doc.fileStoragePath);
    }

    // Otherwise stream from local storage directory
    const root = path.resolve(process.cwd(), ".tongric-local-storage");
    const resolvedPath = path.resolve(root, doc.fileStoragePath);

    if (!resolvedPath.startsWith(`${root}${path.sep}`) && resolvedPath !== root) {
      throw new NotFoundError("File path security check failed.");
    }

    const buffer = await fs.readFile(resolvedPath).catch(() => {
      throw new NotFoundError("Document file not found on disk.");
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": doc.fileMimeType,
        "Content-Disposition": `inline; filename="document-${doc.id}"`,
        "Cache-Control": "private, no-cache, no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

