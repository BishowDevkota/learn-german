import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { requireUser } from "@/lib/guards";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileBottomNav />
    </>
  );
}
