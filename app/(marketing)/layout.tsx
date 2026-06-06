import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* pb-20 on mobile leaves room for the fixed bottom tab bar */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
    </>
  );
}
