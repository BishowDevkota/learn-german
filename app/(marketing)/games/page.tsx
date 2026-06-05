import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { CATEGORIES, GAMES, gameCountByCategory } from "@/lib/games";

export const metadata: Metadata = { title: "All Games" };

export default function GamesIndexPage() {
  const counts = gameCountByCategory();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Games</h1>
        <p className="mt-2 text-muted-foreground">
          {GAMES.length} games across {CATEGORIES.length} categories. Pick a category to start.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link key={c.key} href={`/games/${c.key}`} className="group block">
            <div className="flex h-full items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", c.gradient)}>
                <Icon name={c.icon} className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold group-hover:text-primary">{c.title}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{counts[c.key] ?? 0}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
