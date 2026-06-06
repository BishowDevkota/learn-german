import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      {/* pb-20 on mobile leaves room for the bottom tab bar */}
      <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">{children}</main>
    </div>
  );
}
