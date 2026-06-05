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
export default function WordFamilyTree({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "entries"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.root); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const members: string[] = Array.isArray(item.members) ? item.members : (typeof item.members === "string" ? item.members.split(",").map((s: string) => s.trim()) : []);
  function next() { gameSession.record(true); if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="py-8 text-center space-y-6">
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Root word</p><p className="text-4xl font-extrabold mt-1">{item.root}</p>{item.meaning && <p className="text-muted-foreground mt-1">"{item.meaning}"</p>}</div>
        {members.length > 0 && <div><p className="text-sm text-muted-foreground mb-3">Related words:</p><div className="flex flex-wrap gap-2 justify-center">{members.map((m, i) => <span key={i} className="rounded-full border-2 border-primary px-3 py-1 text-sm font-semibold text-primary">{m}</span>)}</div></div>}
        <Button onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next family"} <ArrowRight /></Button>
      </CardContent></Card>
    </GameShell>
  );
}
