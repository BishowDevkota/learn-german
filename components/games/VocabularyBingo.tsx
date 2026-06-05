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
const SIZE = 5;
export default function VocabularyBingo({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.german && i?.english); }, [content, def]);
  // Bingo needs 25 cards; session size = 1 "bingo game" from a pool of all items
  const { session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems, 1);
  const gameSession = useGameSession({ slug, difficulty, total: 5, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const card = React.useMemo(() => allItems.sort(() => Math.random() - 0.5).slice(0, SIZE * SIZE), [session]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callOrder = React.useMemo(() => [...Array(card.length).keys()].sort(() => Math.random() - 0.5), [session]);
  const [marked, setMarked] = React.useState<Set<number>>(new Set());
  const [callIdx, setCallIdx] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const called = new Set(callOrder.slice(0, callIdx + 1));
  const currentCall = card[callOrder[callIdx]];
  function markCard(cellIdx: number) {
    if (!called.has(cellIdx) || finished) return;
    const m = new Set([...marked, cellIdx]);
    setMarked(m);
    for (let r = 0; r < SIZE; r++) { if ([...Array(SIZE).keys()].every((c) => m.has(r * SIZE + c))) { gameSession.record(true); setFinished(true); return; } }
    for (let c = 0; c < SIZE; c++) { if ([...Array(SIZE).keys()].every((r) => m.has(r * SIZE + c))) { gameSession.record(true); setFinished(true); return; } }
  }
  function nextCall() { if (callIdx + 1 >= card.length) { gameSession.record(false); gameSession.finish(); return; } setCallIdx((i) => i + 1); }
  function handleNextSession() { nextSession(); gameSession.restart(); setMarked(new Set()); setCallIdx(0); setFinished(false); }
  if (allItems.length < SIZE * SIZE) return <GameEmptyState message={`Need at least ${SIZE * SIZE} vocabulary items.`} />;
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Calling</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">{currentCall?.english}</p>
          {finished && <p className="mt-2 text-emerald-500 font-bold text-lg">BINGO! 🎉</p>}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {card.map((item, i) => (
            <button key={i} onClick={() => markCard(i)}
              className={cn("aspect-square rounded-lg border text-xs font-semibold p-1 text-center leading-tight transition-all",
                marked.has(i) ? "bg-primary text-primary-foreground border-primary" : called.has(i) ? "border-primary text-primary hover:bg-accent" : "text-muted-foreground")}>
              {item.german}
            </button>
          ))}
        </div>
        {!finished ? <Button className="w-full" onClick={nextCall}>Call next word</Button>
          : <Button className="w-full" onClick={gameSession.finish}>Finish game</Button>}
      </div>
    </GameShell>
  );
}
