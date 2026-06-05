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
export default function WordLadder({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "puzzles"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((p: Item) => p?.start && p?.end); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const p = sessionItems[index] ?? sessionItems[0];
  const steps: string[] = Array.isArray(p.steps) ? p.steps : [];
  const answer = steps.join(" → ") || p.end;
  const correct = checked && (typed.trim().toLowerCase() === p.end.toLowerCase() || typed.trim().toLowerCase() === answer.toLowerCase());
  function check() { gameSession.record(correct); setChecked(true); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setTyped(""); setChecked(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setTyped(""); setChecked(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        <div className="flex items-center justify-center gap-3 text-xl font-bold">
          <span className="rounded-xl border-2 border-primary px-4 py-2">{p.start}</span>
          <span className="text-muted-foreground">→ ? →</span>
          <span className="rounded-xl border-2 border-primary px-4 py-2">{p.end}</span>
        </div>
        {checked && steps.length > 0 && <div className="flex flex-wrap gap-2 justify-center">{[p.start, ...steps, p.end].map((w, i) => (<span key={i} className="rounded-full border border-emerald-500 bg-emerald-500/10 px-3 py-1 text-sm font-semibold">{w}</span>))}</div>}
        <p className="text-center text-sm text-muted-foreground">Change one letter per step: <strong>{p.start}</strong> → <strong>{p.end}</strong></p>
        <div className="flex gap-2">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !checked && check()} disabled={checked} placeholder="Type the path…" />
          {!checked ? <Button onClick={check} disabled={!typed.trim()}>Check</Button> : <Button variant="outline">{correct ? <Check className="text-emerald-500" /> : <X className="text-destructive" />}</Button>}
        </div>
        {checked && !correct && <p className="text-center text-sm text-destructive">Path: {[p.start, ...steps, p.end].join(" → ")}</p>}
        {checked && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
      </CardContent></Card>
    </GameShell>
  );
}
