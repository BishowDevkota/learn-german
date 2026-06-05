"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function CategorySort({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.word && i?.bucket); }, [content, def]);
  const buckets = React.useMemo(() => [...new Set(allItems.map((i) => i.bucket as string))], [allItems]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [bucketItems, setBucketItems] = React.useState<Record<string, string[]>>({});
  if (allItems.length === 0 || buckets.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const correct = picked === item.bucket;
  function pick(bucket: string) { if (picked) return; const ok = bucket === item.bucket; setPicked(bucket); gameSession.record(ok); setBucketItems((prev) => ({ ...prev, [bucket]: [...(prev[bucket] ?? []), item.word] })); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setPicked(null); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setPicked(null); setBucketItems({}); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card py-10 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Sort this word</p>
          <p className="mt-2 text-4xl font-extrabold">{item.word}</p>
          {picked && <p className={cn("mt-3 font-semibold", correct ? "text-emerald-500" : "text-destructive")}>{correct ? "Correct!" : `Belongs to: ${item.bucket}`}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {buckets.map((bucket) => (
            <button key={bucket} onClick={() => pick(bucket)} disabled={!!picked}
              className={cn("rounded-xl border-2 p-4 text-left transition-all", picked ? bucket === item.bucket ? "border-emerald-500 bg-emerald-500/10" : bucket === picked ? "border-destructive bg-destructive/10" : "opacity-40" : "hover:border-primary hover:bg-accent")}>
              <p className="font-semibold">{bucket}</p>
              {bucketItems[bucket]?.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{bucketItems[bucket].join(", ")}</p>}
            </button>
          ))}
        </div>
        {picked && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next word"}</Button>}
      </div>
    </GameShell>
  );
}
