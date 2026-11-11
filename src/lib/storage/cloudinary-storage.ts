import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { createCloudinaryStorageProvider } from "./cloudinary-storage-core";
import type { StorageProvider } from "./types";

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function buildCloudinaryStorageProvider(
  creds: CloudinaryCredentials,
): StorageProvider {
  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });

  return createCloudinaryStorageProvider({
    async uploadBuffer({ buffer, publicId, visibility, resourceType }) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            type: visibility === "public" ? "upload" : "private",
            resource_type: resourceType,
            overwrite: false,
            unique_filename: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
              return;
            }
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          },
        );
        stream.end(Buffer.from(buffer));
      });
    },

    getPublicUrl(publicId) {
      return cloudinary.url(publicId, {
        type: "upload",
        resource_type: "image",
        secure: true,
        fetch_format: "auto",
        quality: "auto",
      });
    },

    getPrivateSignedUrl({ publicId, format, resourceType, expiresAtSeconds }) {
      return cloudinary.utils.private_download_url(publicId, format, {
        resource_type: resourceType,
        type: "private",
        expires_at: expiresAtSeconds,
      });
    },

    async destroy({ publicId, visibility, resourceType }) {
      await cloudinary.uploader.destroy(publicId, {
        type: visibility === "public" ? "upload" : "private",
        resource_type: resourceType,
      });
    },
  });
}

