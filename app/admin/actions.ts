"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { assertAdmin } from "@/lib/guards";
import User from "@/models/user";

export type ActionResult = { ok: boolean; error?: string };

// ---- User management ----
// Game-content CRUD lives with the admin games editor (added in the admin phase).

export async function setUserRole(id: string, role: "user" | "admin"): Promise<ActionResult> {
  try {
    await assertAdmin();
    await connectDB();
    await User.findByIdAndUpdate(id, { role });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to update role." };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    if (session.user.id === id) return { ok: false, error: "You can't delete your own account." };
    await connectDB();
    await User.findByIdAndDelete(id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to delete user." };
  }
}
