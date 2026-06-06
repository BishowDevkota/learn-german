import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { GameCard } from "@/components/game/game-card";
import { getCategory, gamesByCategory } from "@/lib/games";
import { connectDB } from "@/lib/db";
import Game from "@/models/game";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  return { title: cat ? cat.title : "Games" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const games = gamesByCategory(category);

  // DB state (active flag + thumbnail) for these games; falls back gracefully.
  const dbState = new Map<string, { isActive: boolean; thumbnailUrl: string }>();
  try {
    await connectDB();
    const docs = await Game.find({ category }).select("slug isActive thumbnailUrl").lean();
    for (const d of docs) {
      dbState.set(d.slug, { isActive: d.isActive ?? true, thumbnailUrl: d.thumbnailUrl ?? "" });
    }
  } catch {
    // no DB — show all games as active
  }

  const visible = games.filter((g) => dbState.get(g.slug)?.isActive !== false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-12">
      {/* Category header */}
      <div className="mb-6 flex items-center gap-3 md:mb-8 md:gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white md:size-14", cat.gradient)}>
          <Icon name={cat.icon} className="size-6 md:size-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold md:text-3xl">{cat.title}</h1>
          <p className="text-sm text-muted-foreground md:text-base">{cat.blurb}</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No games available in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((g) => (
            <GameCard key={g.slug} game={g} thumbnailUrl={dbState.get(g.slug)?.thumbnailUrl || undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
