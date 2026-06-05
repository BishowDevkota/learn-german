"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { assertAdmin } from "@/lib/guards";
import Game from "@/models/game";
import { getGame } from "@/lib/games";
import { deleteImage, type ResourceType } from "@/lib/cloudinary";
import { DIFFICULTIES } from "@/lib/validations";

export type ActionResult = { ok: boolean; error?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContent = Record<string, any> | null | undefined;

/** Map every Cloudinary public_id referenced in a content payload to its type. */
function collectAssets(content: AnyContent): Map<string, ResourceType> {
  const assets = new Map<string, ResourceType>();
  if (!content) return assets;
  for (const key of Object.keys(content)) {
    const arr = content[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (item && typeof item === "object") {
        if (item.imagePublicId) assets.set(item.imagePublicId, "image");
        if (item.audioPublicId) assets.set(item.audioPublicId, "video");
      }
    }
  }
  return assets;
}

export interface SaveGameInput {
  description?: string;
  difficulty?: string;
  isActive?: boolean;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: Record<string, any>;
}

/**
 * Persist a game's editable fields + content. Cloudinary assets that were
 * referenced before but are gone from the new payload (removed or replaced)
 * are destroyed AFTER the DB is updated, so a deleted image is never orphaned.
 */
export async function saveGame(slug: string, input: SaveGameInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const def = getGame(slug);
    if (!def) return { ok: false, error: "Unknown game." };
    await connectDB();

    const existing = await Game.findOne({ slug }).lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    if (typeof input.description === "string") update.description = input.description;
    if (input.difficulty && (DIFFICULTIES as readonly string[]).includes(input.difficulty)) {
      update.difficulty = input.difficulty;
    }
    if (typeof input.isActive === "boolean") update.isActive = input.isActive;
    if (typeof input.thumbnailUrl === "string") update.thumbnailUrl = input.thumbnailUrl;
    if (typeof input.thumbnailPublicId === "string") update.thumbnailPublicId = input.thumbnailPublicId;
    if (input.content && typeof input.content === "object") update.content = input.content;

    // Work out which Cloudinary assets are no longer referenced.
    const oldAssets = collectAssets(existing?.content);
    if (existing?.thumbnailPublicId) oldAssets.set(existing.thumbnailPublicId, "image");

    const newContent = input.content ?? existing?.content;
    const newAssets = collectAssets(newContent);
    const newThumb = input.thumbnailPublicId ?? existing?.thumbnailPublicId;
    if (newThumb) newAssets.set(newThumb, "image");

    const removed = [...oldAssets.entries()].filter(([id]) => id && !newAssets.has(id));

    await Game.updateOne(
      { slug },
      {
        $set: update,
        $setOnInsert: {
          title: def.title,
          category: def.category,
        },
      },
      { upsert: true }
    );

    // Best-effort cleanup once the DB no longer points at these assets.
    for (const [id, type] of removed) {
      try {
        await deleteImage(id, type);
      } catch (err) {
        console.error("saveGame: cloudinary cleanup failed for", id, err);
      }
    }

    revalidatePath(`/admin/games/${slug}`);
    revalidatePath("/admin/games");
    revalidatePath(`/games/${def.category}/${slug}`);
    revalidatePath(`/games/${def.category}`);
    return { ok: true };
  } catch (err) {
    console.error("saveGame", err);
    return { ok: false, error: "Failed to save game." };
  }
}

/** Quick active/inactive toggle from the games manager table. */
export async function toggleGameActive(slug: string, isActive: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    const def = getGame(slug);
    if (!def) return { ok: false, error: "Unknown game." };
    await connectDB();
    await Game.updateOne(
      { slug },
      { $set: { isActive }, $setOnInsert: { title: def.title, category: def.category } },
      { upsert: true }
    );
    revalidatePath("/admin/games");
    revalidatePath(`/games/${def.category}`);
    return { ok: true };
  } catch (err) {
    console.error("toggleGameActive", err);
    return { ok: false, error: "Failed to update." };
  }
}
