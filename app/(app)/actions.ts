"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export type ProfileResult = { ok: boolean; error?: string };

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  avatar: z.string().optional(),
});

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatar: formData.get("avatar") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    name: parsed.data.name,
    avatar: parsed.data.avatar ?? "",
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Current password is required"),
    next: z.string().min(8, "New password must be at least 8 characters"),
  });

export async function changePassword(formData: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await connectDB();
  const user = await User.findById(session.user.id).select("+password");
  if (!user) return { ok: false, error: "User not found" };

  const valid = await bcrypt.compare(parsed.data.current, user.password);
  if (!valid) return { ok: false, error: "Current password is incorrect" };

  user.password = await bcrypt.hash(parsed.data.next, 10);
  await user.save();
  return { ok: true };
}
