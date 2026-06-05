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
export default function WordSnake({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "rounds"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((r: Item) => Array.isArray(r?.words) && r.words.length > 1); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const round = sessionItems[index] ?? sessionItems[0];
  const chain: string[] = round.words;
  const prev = chain[step]; const answer = chain[step + 1] ?? "";
  const lastLetter = prev?.slice(-1).toLowerCase();
  const correct = checked && typed.trim().toLowerCase() === answer.toLowerCase();
  function check() { gameSession.record(typed.trim().toLowerCase() === answer.toLowerCase()); setChecked(true); }
  function next() {
    if (step + 1 < chain.length - 1) { setStep((s) => s + 1); setTyped(""); setChecked(false); return; }
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setStep(0); setTyped(""); setChecked(false);
  }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setStep(0); setTyped(""); setChecked(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {chain.map((w, i) => (<span key={i} className={cn("rounded-full px-3 py-1 text-sm font-semibold border-2", i < step ? "border-emerald-500 bg-emerald-500/10" : i === step ? "border-primary bg-accent" : "border-dashed text-muted-foreground")}>{i <= step ? w : "?"}</span>))}
        </div>
        <p className="text-center text-muted-foreground text-sm">What word starts with <strong className="text-primary uppercase">{lastLetter}</strong>?</p>
        <div className="flex gap-2">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !checked && check()} disabled={checked} placeholder={`Starts with ${lastLetter}…`} autoFocus />
          {!checked ? <Button onClick={check} disabled={!typed.trim()}>Check</Button> : <Button variant="outline">{correct ? <Check className="text-emerald-500" /> : <X className="text-destructive" />}</Button>}
        </div>
        {checked && !correct && <p className="text-center text-sm text-destructive">Answer: <strong>{answer}</strong></p>}
        {checked && <Button className="w-full" onClick={next}>{step + 1 >= chain.length - 1 && index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
      </CardContent></Card>
    </GameShell>
  );
}
