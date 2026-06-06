"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Award,
  BarChart3,
  Home,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 px-4 py-5 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">A</span>
          Admin
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}>
                <l.icon className="size-4 shrink-0" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t p-2">
          <ThemeToggle />
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Home className="size-4" /> Back to site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
              <l.icon className="size-5" />
              <span className="sr-only sm:not-sr-only">{l.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
        >
          <LogOut className="size-5" />
          <span className="sr-only sm:not-sr-only">Out</span>
        </button>
      </nav>
    </>
  );
}
