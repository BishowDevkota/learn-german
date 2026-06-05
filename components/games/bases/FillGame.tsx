"use client";

import * as React from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
const TEXT_KEYS = ["text", "sentence", "story", "line", "step"];
function getSentence(item: Item): string {
  for (const k of TEXT_KEYS) if (item[k] && typeof item[k] === "string") return item[k];
  return "";
}
function normalize(s: string) { return s.trim().toLowerCase(); }

export function FillGame({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "items";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.answer);
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [picked, setPicked] = React.useState<string | null>(null);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const sentence = getSentence(item);
  const answer = String(item.answer ?? "");
  const hint = item.hint ?? "";
  const options: string[] = Array.isArray(item.options)
    ? shuffle([answer, ...item.options.filter((o: string) => o !== answer)]).slice(0, 4)
    : [];
  const hasOptions = options.length > 1;
  const correct = checked && normalize(typed) === normalize(answer);

  function check() {
    if (!typed.trim()) return;
    gameSession.record(normalize(typed) === normalize(answer));
    setChecked(true);
  }
  function pickOption(opt: string) {
    if (picked) return;
    setPicked(opt);
    gameSession.record(opt === answer);
  }
  function next() {
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setTyped(""); setChecked(false); setPicked(null);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setTyped(""); setChecked(false); setPicked(null);
  }

  const parts = sentence.includes("___") ? sentence.split("___") : [sentence, ""];

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8">
        {hint && <p className="text-center text-sm text-muted-foreground">Hint: {hint}</p>}
        <p className="text-center text-lg leading-relaxed">
          {parts[0]}
          {hasOptions ? (
            <span className={cn("mx-1 rounded border-b-2 px-1", picked === answer ? "border-emerald-500 text-emerald-600" : picked ? "border-destructive text-destructive" : "border-primary")}>{picked ?? "___"}</span>
          ) : (
            <span className={cn("mx-1 rounded border-b-2 px-1 font-semibold", checked ? (correct ? "border-emerald-500 text-emerald-600" : "border-destructive text-destructive") : "border-primary")}>{typed || "___"}</span>
          )}
          {parts[1]}
        </p>

        {hasOptions ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((opt) => {
              const state = picked ? (opt === answer ? "correct" : opt === picked ? "wrong" : "idle") : "idle";
              return (
                <button key={opt} onClick={() => pickOption(opt)} disabled={!!picked}
                  className={cn("rounded-lg border-2 px-4 py-2.5 font-medium transition-all",
                    state === "idle" && "hover:border-primary hover:bg-accent",
                    state === "correct" && "border-emerald-500 bg-emerald-500/10",
                    state === "wrong" && "border-destructive bg-destructive/10"
                  )}>{opt}</button>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={typed} onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !checked && check()}
              placeholder="Type your answer…" disabled={checked} autoFocus />
            {!checked ? <Button onClick={check} disabled={!typed.trim()}>Check</Button>
              : <Button variant={correct ? "default" : "destructive"}>{correct ? <Check /> : <X />}</Button>}
          </div>
        )}
        {checked && !correct && <p className="text-center text-sm text-muted-foreground">Correct: <strong>{answer}</strong></p>}
        {(checked || picked) && (
          <Button className="w-full" onClick={next}>
            {index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight />
          </Button>
        )}
      </CardContent></Card>
    </GameShell>
  );
}
