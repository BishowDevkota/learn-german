"use client";
import * as React from "react";
import { CheckCircle, XCircle } from "lucide-react";
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
export default function TwentyQuestionsGerman({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.answer && Array.isArray(i?.clues)); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const clues: string[] = item.clues;
  const correct = checked && typed.trim().toLowerCase() === item.answer.toLowerCase();
  function check() { gameSession.record(correct); setChecked(true); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setRevealed(0); setTyped(""); setChecked(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setRevealed(0); setTyped(""); setChecked(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-4 py-8">
        <p className="text-center font-semibold">Guess the German word from the clues!</p>
        <div className="space-y-2">{clues.slice(0, revealed + 1).map((clue, i) => (<div key={i} className="flex items-start gap-2 rounded-lg border p-3"><span className="text-muted-foreground text-sm">#{i + 1}</span><p className="text-sm">{clue}</p></div>))}</div>
        {revealed < clues.length - 1 && !checked && <Button variant="outline" className="w-full" onClick={() => setRevealed((r) => r + 1)}>Reveal clue {revealed + 2}</Button>}
        {!checked ? (
          <div className="flex gap-2"><Input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="Your guess…" autoFocus /><Button onClick={check} disabled={!typed.trim()}>Guess</Button></div>
        ) : (
          <div className={cn("flex items-center gap-2 rounded-lg border-2 p-3", correct ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10")}>
            {correct ? <CheckCircle className="text-emerald-500" /> : <XCircle className="text-destructive" />}
            <p className="font-semibold">{correct ? "Correct!" : `Answer: ${item.answer}`}</p>
          </div>
        )}
        {checked && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next word"}</Button>}
      </CardContent></Card>
    </GameShell>
  );
}
