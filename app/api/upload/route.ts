import { NextResponse, type NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { assertAdmin } from "@/lib/guards";

/**
 * Signed, admin-only upload. Accepts multipart form-data with `file` and an
 * optional `folder` (defaults to "misc"; callers pass the game slug). Returns
 * `{ url, publicId, resourceType }` — the publicId MUST be persisted.
 */
export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form-data." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = (form.get("folder") as string) || "misc";
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const asset = await uploadImage(file, folder);
    return NextResponse.json(asset);
  } catch (err) {
    console.error("POST /api/upload", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
