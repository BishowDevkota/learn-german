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

export function DragWordsGame({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "sentences";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.sentence);
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [placed, setPlaced] = React.useState<string[]>([]);
  const [checked, setChecked] = React.useState(false);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const sentence: string = item?.sentence ?? "";
  const translation: string = item?.translation ?? "";
  const words = sentence.split(" ").filter(Boolean);
  const tiles = React.useMemo(() => shuffle([...words]), [sentence]); // eslint-disable-line react-hooks/exhaustive-deps
  const correct = checked && placed.join(" ").toLowerCase() === sentence.toLowerCase();

  function placeWord(word: string) { if (checked || placed.length >= words.length) return; setPlaced((p) => [...p, word]); }
  function removePlaced(i: number) { if (checked) return; setPlaced((p) => p.filter((_, idx) => idx !== i)); }
  function check() {
    if (placed.length !== words.length) return;
    gameSession.record(placed.join(" ").toLowerCase() === sentence.toLowerCase());
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
        {translation && <p className="text-center text-sm text-muted-foreground">"{translation}"</p>}
        <div className="min-h-14 flex flex-wrap gap-2 rounded-xl border-2 border-dashed p-3">
          {placed.map((w, i) => (
            <button key={i} onClick={() => removePlaced(i)}
              className={cn("rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-all",
                checked ? (correct ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10") : "border-primary bg-accent"
              )}>{w}</button>
          ))}
          {placed.length === 0 && <span className="text-sm text-muted-foreground">Click words to build the sentence…</span>}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {tiles.map((w, i) => {
            const usedCount = placed.filter((x) => x === w).length;
            const totalCount = tiles.slice(0, i + 1).filter((x) => x === w).length;
            const used = usedCount >= totalCount;
            return (
              <button key={i} onClick={() => placeWord(w)} disabled={checked || used}
                className={cn("rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-all",
                  used ? "opacity-30 cursor-not-allowed" : "hover:border-primary hover:bg-accent"
                )}>{w}</button>
            );
          })}
        </div>
        {checked && !correct && <p className="text-center text-sm text-destructive">Correct: <strong>{sentence}</strong></p>}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => { setPlaced([]); setChecked(false); }}><RotateCcw /> Reset</Button>
          {!checked
            ? <Button className="flex-1" onClick={check} disabled={placed.length !== words.length}>Check</Button>
            : <Button className="flex-1" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
        </div>
      </CardContent></Card>
    </GameShell>
  );
}
