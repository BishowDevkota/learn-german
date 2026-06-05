"use client";

import * as React from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

export interface TypeConfig { reverse?: boolean; partial?: boolean; revealedCount?: number; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
const PROMPT_KEYS = ["word", "prompt", "question", "sentence", "verb", "singular", "german", "root", "riddle", "puzzle"];
function getPrompt(item: Item): string {
  for (const k of PROMPT_KEYS) if (item[k] && typeof item[k] === "string") return item[k];
  return "";
}
function getAnswer(item: Item, config: TypeConfig): string {
  if (config.reverse) return getPrompt(item).split("").reverse().join("");
  return String(item.answer ?? item.plural ?? item.translation ?? item.meaning ?? item.compound ?? "");
}
function normalize(s: string) { return s.trim().toLowerCase(); }

export function TypeGame({ slug, difficulty, content, isAuthed, config = {} }: GameComponentProps & { config?: TypeConfig }) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "items";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => getPrompt(i) || getAnswer(i, config));
  }, [content, def, config]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const prompt = getPrompt(item);
  const answer = getAnswer(item, config);
  const hint = item.hint ?? item.meaning ?? "";
  const correct = checked && normalize(typed) === normalize(answer);
  const displayPrompt = config.partial ? prompt.slice(0, config.revealedCount ?? 2) + "…" : prompt;

  function check() {
    if (!typed.trim()) return;
    gameSession.record(normalize(typed) === normalize(answer));
    setChecked(true);
  }
  function next() {
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setTyped(""); setChecked(false);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setTyped(""); setChecked(false);
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        {hint && !checked && <p className="text-center text-sm text-muted-foreground">{hint}</p>}
        <p className="text-center text-3xl font-bold tracking-wider">{displayPrompt}</p>
        <div className="flex gap-2">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !checked && check()}
            placeholder="Type your answer…" disabled={checked} autoFocus
            className={cn(checked && (correct ? "border-emerald-500" : "border-destructive"))} />
          {!checked ? <Button onClick={check} disabled={!typed.trim()}>Check</Button>
            : <Button variant="outline">{correct ? <Check className="text-emerald-500" /> : <X className="text-destructive" />}</Button>}
        </div>
        {checked && <p className={cn("text-center text-sm", correct ? "text-emerald-600" : "text-destructive")}>{correct ? "Correct!" : `Answer: ${answer}`}</p>}
        {checked && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
      </CardContent></Card>
    </GameShell>
  );
}
