import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { requireUser } from "@/lib/guards";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
