"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function FalseFriends({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.german && i?.actualMeaning); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  function next() { gameSession.record(true); if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setRevealed(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setRevealed(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">What does this really mean?</p>
          <p className="mt-2 text-5xl font-extrabold">{item.german}</p>
          {item.looksLike && <p className="mt-2 text-muted-foreground">Looks like English: <em>{item.looksLike}</em></p>}
        </div>
        {!revealed ? <Button className="w-full" onClick={() => setRevealed(true)}>Reveal actual meaning</Button>
          : (<><div className="rounded-xl border-2 border-amber-500 bg-amber-500/10 p-6"><p className="text-xs uppercase tracking-wide text-amber-600 mb-1">Actually means:</p><p className="text-2xl font-bold">{item.actualMeaning}</p></div>
            <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button></>)}
      </CardContent></Card>
    </GameShell>
  );
}
