import { NextResponse, type NextRequest } from "next/server";
import { deleteImage, type ResourceType } from "@/lib/cloudinary";
import { assertAdmin } from "@/lib/guards";

/**
 * Admin-only Cloudinary delete. Body: `{ publicId, resourceType? }`.
 * Always destroy the Cloudinary asset BEFORE clearing the DB reference.
 */
export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { publicId?: string; resourceType?: ResourceType };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  if (!body.publicId) {
    return NextResponse.json({ error: "publicId is required." }, { status: 400 });
  }

  try {
    const result = await deleteImage(body.publicId, body.resourceType ?? "image");
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/delete-image", err);
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
