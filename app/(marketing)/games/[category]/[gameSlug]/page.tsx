import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Hammer } from "lucide-react";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getGame, getCategory } from "@/lib/games";
import { isGameImplemented } from "@/lib/games/components";
import { GameLoader } from "@/components/games/game-loader";
import { connectDB } from "@/lib/db";
import Game from "@/models/game";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; gameSlug: string }>;
}): Promise<Metadata> {
  const { gameSlug } = await params;
  const def = getGame(gameSlug);
  return { title: def ? def.title : "Game" };
}

export default async function GamePlayPage({
  params,
}: {
  params: Promise<{ category: string; gameSlug: string }>;
}) {
  const { category, gameSlug } = await params;
  const def = getGame(gameSlug);
  if (!def || def.category !== category) notFound();

  const cat = getCategory(def.category);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let content: Record<string, any> = { [def.itemsKey]: [] };
  let isActive = true;
  try {
    await connectDB();
    const doc = await Game.findOne({ slug: gameSlug }).lean();
    if (doc) {
      isActive = doc.isActive ?? true;
      // Round-trip to guarantee a plain, serialisable payload for the client.
      content = JSON.parse(JSON.stringify(doc.content ?? content));
    }
  } catch {
    // no DB — render with empty content (component shows its empty state)
  }

  if (!isActive) notFound();

  const session = await auth();
  const isAuthed = !!session?.user;
  const implemented = isGameImplemented(gameSlug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/games/${def.category}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {cat?.title ?? "Back"}
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", cat?.gradient ?? "from-slate-500 to-slate-700")}>
          <Icon name={def.icon} className="size-6" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{def.title}</h1>
            <Badge variant="secondary" className="capitalize">{def.difficulty}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
      </div>

      {implemented ? (
        <GameLoader slug={def.slug} difficulty={def.difficulty} content={content} isAuthed={isAuthed} />
      ) : (
        <div className="rounded-xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-accent text-accent-foreground">
            <Hammer className="size-7" />
          </div>
          <h2 className="text-lg font-semibold">This game is being built</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {def.title} is on the way. Its content is ready in the admin — the interactive
            component lands in an upcoming release.
          </p>
        </div>
      )}
    </div>
  );
}
