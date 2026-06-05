import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Returns the session or redirects to login. Use in server components/actions. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Returns the session or redirects. Throws-by-redirect if not an admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

/** Lightweight check for use inside server actions (no redirect). */
export async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return session;
}
