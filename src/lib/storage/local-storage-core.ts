import fs from "node:fs/promises";
import path from "node:path";
import { NotFoundError } from "@/lib/errors";
import { assertSafeStorageKey, validateUploadInput } from "./validation";
import type {
  GetAccessUrlOptions,
  StorageProvider,
  StoredObject,
  UploadFileInput,
} from "./types";

/**
 * Development & test fallback storage provider writing outside public/
 * so private documents are never exposed via unauthenticated static paths.
 */
export function createLocalStorageProvider(rootDir: string): StorageProvider & {
  readBuffer(providerKey: string): Promise<Buffer>;
} {
  const resolvedRoot = path.resolve(rootDir);

  function resolveSafePath(providerKey: string): string {
    const safeKey = assertSafeStorageKey(providerKey);
    const target = path.resolve(resolvedRoot, safeKey);
    if (!target.startsWith(`${resolvedRoot}${path.sep}`)) {
      throw new Error("Resolved path escapes storage root");
    }
    return target;
  }

  return {
    providerName: "local",

    async upload(input: UploadFileInput): Promise<StoredObject> {
      const { safeKey, mimeType, sizeBytes } = validateUploadInput(input);
      const providerKey = `${input.visibility}/${safeKey}`;
      const targetPath = resolveSafePath(providerKey);

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, Buffer.from(input.buffer));

      return {
        key: safeKey,
        providerKey,
        visibility: input.visibility,
        mimeType,
        sizeBytes,
        publicUrl:
          input.visibility === "public" ? `local://${providerKey}` : null,
      };
    },

    async getAccessUrl(
      providerKey: string,
      options: GetAccessUrlOptions,
    ): Promise<string> {
      const safeProviderKey = assertSafeStorageKey(providerKey);
      const targetPath = resolveSafePath(safeProviderKey);

      try {
        await fs.access(targetPath);
      } catch {
        throw new NotFoundError("Stored file not found");
      }

      if (options.visibility === "public") {
        return `local://${safeProviderKey}`;
      }

      return `local-signed://${safeProviderKey}`;
    },

    async delete(providerKey: string): Promise<void> {
      const targetPath = resolveSafePath(providerKey);
      await fs.rm(targetPath, { force: true });
    },

    async readBuffer(providerKey: string): Promise<Buffer> {
      const targetPath = resolveSafePath(providerKey);
      return fs.readFile(targetPath);
    },
  };
}
