import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Game from "@/models/game";
import { GAMES, CATEGORIES, getCategory } from "@/lib/games";
import { GamesTable } from "@/components/admin/games-table";

export const metadata: Metadata = { title: "Games" };
export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const state = new Map<string, { isActive: boolean; items: number }>();
  try {
    await connectDB();
    const docs = await Game.find().select("slug isActive content").lean();
    for (const d of docs) {
      const content = (d.content ?? {}) as Record<string, unknown>;
      const arr = Object.values(content).find((v) => Array.isArray(v)) as unknown[] | undefined;
      state.set(d.slug, { isActive: d.isActive ?? true, items: Array.isArray(arr) ? arr.length : 0 });
    }
  } catch {
    // no DB — show registry defaults
  }

  const rows = GAMES.map((g) => ({
    slug: g.slug,
    title: g.title,
    category: g.category,
    categoryTitle: getCategory(g.category)?.title ?? g.category,
    difficulty: g.difficulty,
    isActive: state.get(g.slug)?.isActive ?? true,
    items: state.get(g.slug)?.items ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Games</h1>
        <p className="text-muted-foreground">
          {GAMES.length} games. Edit content, toggle visibility, and manage images.
        </p>
      </div>
      <GamesTable rows={rows} categories={CATEGORIES.map((c) => ({ key: c.key, title: c.title }))} />
    </div>
  );
}
