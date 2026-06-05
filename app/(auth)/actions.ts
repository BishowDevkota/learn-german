"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { registerSchema } from "@/lib/validations";

export type RegisterState = { error?: string; success?: boolean };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return { error: "An account with this email already exists." };

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash, role: "user" });
    return { success: true };
  } catch (err) {
    console.error("registerAction error", err);
    return { error: "Something went wrong. Please try again." };
  }
}
