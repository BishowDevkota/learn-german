import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getGame, getCategory } from "@/lib/games";
import { connectDB } from "@/lib/db";
import Game from "@/models/game";
import { GameEditor } from "@/components/admin/game-editor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}): Promise<Metadata> {
  const { gameSlug } = await params;
  const def = getGame(gameSlug);
  return { title: def ? `Edit · ${def.title}` : "Edit Game" };
}

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const def = getGame(gameSlug);
  if (!def) notFound();

  let initial = {
    description: def.description,
    difficulty: def.difficulty as string,
    isActive: true,
    thumbnailUrl: "",
    thumbnailPublicId: "",
    items: [] as Record<string, unknown>[],
  };

  try {
    await connectDB();
    const doc = await Game.findOne({ slug: gameSlug }).lean();
    if (doc) {
      const content = (doc.content ?? {}) as Record<string, unknown>;
      const items = (content[def.itemsKey] as Record<string, unknown>[]) ?? [];
      initial = {
        description: doc.description ?? def.description,
        difficulty: (doc.difficulty as string) ?? def.difficulty,
        isActive: doc.isActive ?? true,
        thumbnailUrl: doc.thumbnailUrl ?? "",
        thumbnailPublicId: doc.thumbnailPublicId ?? "",
        items: JSON.parse(JSON.stringify(items)),
      };
    }
  } catch {
    // no DB — start from registry defaults
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/games"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All games
      </Link>
      <GameEditor def={def} initial={initial} categoryTitle={getCategory(def.category)?.title ?? def.category} />
    </div>
  );
}
