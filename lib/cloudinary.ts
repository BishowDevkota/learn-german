import { v2 as cloudinary } from "cloudinary";

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

/** Base folder for every asset; per-game folders nest under it. */
export const ROOT_FOLDER = "german-games";

export type ResourceType = "image" | "video";

export interface UploadedAsset {
  url: string;
  publicId: string;
  resourceType: ResourceType;
}

function assertConfigured() {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET."
    );
  }
}

/** Audio is stored as a Cloudinary `video` resource; images as `image`. */
function resourceTypeFor(mime: string): ResourceType {
  return mime.startsWith("audio") || mime.startsWith("video") ? "video" : "image";
}

/**
 * Upload a single file (signed, server-side). Returns both the secure URL and
 * the public_id — the public_id MUST be persisted so the asset can later be
 * deleted or replaced. Files are organised under `german-games/{folder}/`.
 */
export async function uploadImage(
  file: File,
  folder: string
): Promise<UploadedAsset> {
  assertConfigured();
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file provided.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const resourceType = resourceTypeFor(file.type);
  const targetFolder = `${ROOT_FOLDER}/${folder}`.replace(/\/+$/, "");

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: targetFolder, resource_type: resourceType },
          (err, res) =>
            err || !res
              ? reject(err ?? new Error("Upload returned no result"))
              : resolve(res as { secure_url: string; public_id: string })
        )
        .end(bytes);
    }
  );

  return { url: result.secure_url, publicId: result.public_id, resourceType };
}

/**
 * Destroy an asset in Cloudinary. Pass the same resourceType that was used to
 * upload it (images default). Returns `{ success }`; "not found" counts as
 * success so callers can safely clear a dangling reference.
 */
export async function deleteImage(
  publicId: string,
  resourceType: ResourceType = "image"
): Promise<{ success: boolean }> {
  assertConfigured();
  if (!publicId) return { success: true };

  const res = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return { success: res.result === "ok" || res.result === "not found" };
}

/**
 * Replace an asset: upload the new file first, and only delete the old asset
 * once the new one is safely in place. If the upload fails, the old asset is
 * left untouched (the caller's DB row stays valid).
 */
export async function replaceImage(
  oldPublicId: string,
  newFile: File,
  folder: string
): Promise<UploadedAsset> {
  assertConfigured();
  const uploaded = await uploadImage(newFile, folder);
  if (oldPublicId && oldPublicId !== uploaded.publicId) {
    try {
      await deleteImage(oldPublicId, uploaded.resourceType);
    } catch (err) {
      // The new asset is live; a failed cleanup of the old one is non-fatal.
      console.error("replaceImage: failed to delete old asset", oldPublicId, err);
    }
  }
  return uploaded;
}
