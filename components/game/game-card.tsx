import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategory, type GameDefinition } from "@/lib/games";

/** Public catalog card for a single game. Links to /games/{category}/{slug}. */
export function GameCard({
  game,
  thumbnailUrl,
}: {
  game: GameDefinition;
  thumbnailUrl?: string;
}) {
  const category = getCategory(game.category);
  const gradient = category?.gradient ?? "from-slate-500 to-slate-700";

  return (
    <Link href={`/games/${game.category}/${game.slug}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className={cn("relative h-28 bg-gradient-to-br", gradient)}>
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={game.title} fill className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-white/90">
              <Icon name={game.icon} className="size-9" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold group-hover:text-primary">{game.title}</h3>
          <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{game.description}</p>
          <div className="mt-3">
            <Badge variant="secondary" className="capitalize">{game.difficulty}</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
