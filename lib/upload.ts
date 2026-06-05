"use server";

import { uploadImage, deleteImage, isCloudinaryConfigured, type ResourceType } from "./cloudinary";
import { assertAdmin } from "./guards";

export type UploadResult =
  | { url: string; publicId: string; resourceType: ResourceType; error?: undefined }
  | { error: string; url?: undefined; publicId?: undefined; resourceType?: undefined };

/**
 * Server-action wrapper around the Cloudinary upload helper, for forms that
 * prefer actions over the /api/upload route. Admin-only. Pass `folder` (the
 * game slug) so assets are organised under `german-games/{slug}/`.
 */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  if (!isCloudinaryConfigured) {
    return { error: "Cloudinary is not configured. Paste a URL instead." };
  }

  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "misc";
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }

  try {
    const asset = await uploadImage(file, folder);
    return { url: asset.url, publicId: asset.publicId, resourceType: asset.resourceType };
  } catch (err) {
    console.error("uploadMedia error", err);
    return { error: "Upload failed. Please try again." };
  }
}

/** Server-action wrapper around the Cloudinary delete helper. Admin-only. */
export async function deleteMedia(
  publicId: string,
  resourceType: ResourceType = "image"
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, error: "Unauthorized" };
  }
  if (!isCloudinaryConfigured) return { success: false, error: "Cloudinary not configured." };
  try {
    return await deleteImage(publicId, resourceType);
  } catch (err) {
    console.error("deleteMedia error", err);
    return { success: false, error: "Delete failed." };
  }
}
