import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 via-background to-sky-500/10" />
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        LinguaQuest
      </Link>
      {children}
    </div>
  );
}
