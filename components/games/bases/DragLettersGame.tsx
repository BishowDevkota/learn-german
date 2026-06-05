"use client";

import * as React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

export function DragLettersGame({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "items";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.word);
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [placed, setPlaced] = React.useState<string[]>([]);
  const [checked, setChecked] = React.useState(false);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const word: string = item?.word ?? "";
  const hint: string = item?.hint ?? item?.meaning ?? "";
  const tiles = React.useMemo(() => shuffle(word.split("")), [word]); // eslint-disable-line react-hooks/exhaustive-deps
  const correct = checked && placed.join("").toLowerCase() === word.toLowerCase();

  function placeTile(letter: string) { if (checked || placed.length >= word.length) return; setPlaced((p) => [...p, letter]); }
  function removePlaced(i: number) { if (checked) return; setPlaced((p) => p.filter((_, idx) => idx !== i)); }
  function check() {
    if (placed.length !== word.length) return;
    gameSession.record(placed.join("").toLowerCase() === word.toLowerCase());
    setChecked(true);
  }
  function next() {
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setPlaced([]); setChecked(false);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setPlaced([]); setChecked(false);
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        {hint && <p className="text-center text-sm text-muted-foreground">{hint}</p>}
        <div className="flex flex-wrap justify-center gap-2 min-h-12">
          {Array.from({ length: word.length }).map((_, i) => (
            <button key={i} onClick={() => removePlaced(i)}
              className={cn("flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-bold uppercase transition-all",
                placed[i] ? (checked ? (correct ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10") : "border-primary bg-accent") : "border-dashed border-muted-foreground"
              )}>{placed[i] ?? ""}</button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {tiles.map((letter, i) => {
            const used = placed.filter((l) => l === letter).length > tiles.slice(0, i).filter((l) => l === letter).length;
            return (
              <button key={i} onClick={() => placeTile(letter)} disabled={checked}
                className={cn("h-10 w-10 rounded-lg border-2 text-lg font-bold uppercase transition-all",
                  used ? "opacity-30 cursor-not-allowed" : "hover:border-primary hover:bg-accent"
                )}>{letter}</button>
            );
          })}
        </div>
        {checked && !correct && <p className="text-center text-sm text-destructive">Answer: <strong>{word}</strong></p>}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => { setPlaced([]); setChecked(false); }}><RotateCcw /> Reset</Button>
          {!checked
            ? <Button className="flex-1" onClick={check} disabled={placed.length !== word.length}>Check</Button>
            : <Button className="flex-1" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
        </div>
      </CardContent></Card>
    </GameShell>
  );
}
