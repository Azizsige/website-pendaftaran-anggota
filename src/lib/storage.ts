import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const DATA_URI_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

export type UploadFolder = "photos" | "ktm" | "branding";

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** True jika string adalah URL (sudah di storage), bukan data URI. */
export function isRemoteUrl(value: string | null | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value);
}

/**
 * Upload gambar (data URI) ke object storage dan kembalikan URL-nya.
 * Jika Cloudinary belum dikonfigurasi, data URI dikembalikan apa adanya (fallback dev)
 * dan peringatan dicatat di log.
 */
export async function uploadImage(
  dataUri: string | null | undefined,
  folder: UploadFolder
): Promise<string> {
  if (!dataUri) return "";
  if (isRemoteUrl(dataUri)) return dataUri;

  if (!DATA_URI_PATTERN.test(dataUri)) {
    throw new AppError("Format gambar tidak valid. Gunakan PNG, JPG, atau WEBP.", "INVALID_IMAGE");
  }

  const approxBytes = Math.floor((dataUri.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    throw new AppError("Ukuran gambar terlalu besar (maksimal 5 MB).", "IMAGE_TOO_LARGE");
  }

  if (!isCloudinaryConfigured()) {
    if (process.env.NODE_ENV === "production") {
      logger.warn("Cloudinary belum dikonfigurasi: gambar disimpan sebagai data URI di database.");
    }
    return dataUri;
  }

  configure();
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `pendaftaran-anggota/${folder}`,
    resource_type: "image",
    overwrite: false,
  });
  return result.secure_url;
}
