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
    <aside className="flex w-full flex-row gap-1 overflow-x-auto border-b bg-card p-2 md:h-screen md:w-60 md:flex-col md:gap-1 md:border-b-0 md:border-r md:p-4">
      <div className="mb-0 hidden items-center gap-2 px-2 py-3 font-bold md:mb-4 md:flex">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">A</span>
        Admin
      </div>

      <nav className="flex flex-1 flex-row gap-1 md:flex-col">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <l.icon className="size-4 shrink-0" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-row items-center gap-1 md:flex-col md:items-stretch md:border-t md:pt-3">
        <ThemeToggle />
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          <Home className="size-4" /> <span className="hidden md:inline">Back to site</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4" /> <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
