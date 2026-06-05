"use client";
import * as React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function WordOfTheDay({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "entries"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.german && i?.english); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"learn" | "quiz">("learn");
  const [picked, setPicked] = React.useState<string | null>(null);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const distractors = sessionItems.filter((_, i) => i !== index).map((i) => i.english).slice(0, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = React.useMemo(() => shuffle([item.english, ...distractors]), [item, session]);
  function pick(opt: string) {
    if (picked) return; setPicked(opt); gameSession.record(opt === item.english);
    setTimeout(() => { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setPicked(null); setPhase("learn"); }, 900);
  }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setPicked(null); setPhase("learn"); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        {phase === "learn" ? (
          <>
            <div className="text-center"><p className="text-xs uppercase tracking-wide text-muted-foreground">Word of the day</p>
              <p className="mt-2 text-5xl font-extrabold">{item.german}</p><p className="mt-2 text-2xl text-muted-foreground">{item.english}</p></div>
            {item.example && <div className="rounded-lg border bg-muted/30 p-4"><p className="italic">"{item.example}"</p>{item.exampleTranslation && <p className="mt-1 text-sm text-muted-foreground">{item.exampleTranslation}</p>}</div>}
            <Button className="w-full" onClick={() => setPhase("quiz")}>Quiz me!</Button>
          </>
        ) : (
          <>
            <p className="text-center text-lg">What does <strong>{item.german}</strong> mean?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((opt) => { const state = picked ? (opt === item.english ? "correct" : opt === picked ? "wrong" : "idle") : "idle"; return (
                <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
                  className={cn("flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left font-medium transition-all",
                    state === "idle" && "hover:border-primary hover:bg-accent",
                    state === "correct" && "border-emerald-500 bg-emerald-500/10",
                    state === "wrong" && "border-destructive bg-destructive/10")}>
                  {opt}{state === "correct" && <Check className="size-4 text-emerald-500" />}{state === "wrong" && <X className="size-4 text-destructive" />}
                </button>); })}
            </div>
          </>
        )}
      </CardContent></Card>
    </GameShell>
  );
}
