"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Gamepad2, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboard", label: "Ranks", icon: Trophy },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const profileHref = session?.user ? "/dashboard" : "/login";
  const allTabs = [...TABS, { href: profileHref, label: session?.user ? "Profile" : "Login", icon: User, exact: false }];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {allTabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <t.icon className={cn("size-[22px] transition-transform", active && "scale-110")} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
