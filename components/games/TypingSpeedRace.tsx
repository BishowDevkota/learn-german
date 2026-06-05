"use client";
import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function TypingSpeedRace({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.phrase); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [done, setDone] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const phrase: string = item.phrase ?? "";
  function onType(val: string) { if (done) return; setTyped(val); if (val === phrase) { gameSession.record(true); setDone(true); } }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setTyped(""); setDone(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setTyped(""); setDone(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        <div className="relative h-8 rounded-full bg-muted overflow-hidden">
          <motion.div className="absolute inset-y-0 left-0 bg-primary rounded-full" animate={{ width: `${(typed.length / phrase.length) * 100}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">🏎️ {Math.round((typed.length / phrase.length) * 100)}%</div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 font-mono text-lg">
          {phrase.split("").map((char, i) => (
            <span key={i} className={cn(i < typed.length ? (typed[i] === char ? "text-emerald-500" : "text-destructive") : i === typed.length ? "underline" : "text-muted-foreground")}>{char}</span>
          ))}
        </div>
        <Input value={typed} onChange={(e) => onType(e.target.value)} placeholder="Type the phrase above…" autoFocus disabled={done} className={cn("font-mono", !phrase.startsWith(typed) && typed && "border-destructive")} />
        {item.translation && <p className="text-center text-sm text-muted-foreground">({item.translation})</p>}
        {done && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next phrase"}</Button>}
      </CardContent></Card>
    </GameShell>
  );
}
