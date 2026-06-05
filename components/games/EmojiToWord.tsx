"use client";
import * as React from "react";
import { ArrowRight, Check, X } from "lucide-react";
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
export default function EmojiToWord({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.emoji && i?.word); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const correct = checked && typed.trim().toLowerCase() === item.word.toLowerCase();
  function check() { if (!typed.trim()) return; gameSession.record(typed.trim().toLowerCase() === item.word.toLowerCase()); setChecked(true); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setTyped(""); setChecked(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setTyped(""); setChecked(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8 text-center">
        <p className="text-8xl">{item.emoji}</p>
        {item.english && <p className="text-sm text-muted-foreground">({item.english})</p>}
        <div className="flex gap-2 max-w-xs mx-auto">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !checked && check()} placeholder="German word…" disabled={checked} className={cn(checked && (correct ? "border-emerald-500" : "border-destructive"))} autoFocus />
          {!checked ? <Button onClick={check} disabled={!typed.trim()}>Check</Button> : <Button variant="outline">{correct ? <Check className="text-emerald-500" /> : <X className="text-destructive" />}</Button>}
        </div>
        {checked && !correct && <p className="text-sm text-destructive">Correct: <strong>{item.word}</strong></p>}
        {checked && <Button onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
      </CardContent></Card>
    </GameShell>
  );
}
