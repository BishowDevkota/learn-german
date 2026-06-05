"use client";
import * as React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function CompoundWordBuilder({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "items"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.part1 && i?.part2); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [checked, setChecked] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parts = React.useMemo(() => shuffle([item.part1, item.part2]), [`${session}-${index}`]);
  const answer = item.compound ?? (item.part1 + item.part2);
  const built = selected.join("");
  const correct = checked && built.toLowerCase() === answer.toLowerCase();
  function pick(p: string) { if (checked || selected.includes(p)) return; setSelected((s) => [...s, p]); }
  function check() { gameSession.record(built.toLowerCase() === answer.toLowerCase()); setChecked(true); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setSelected([]); setChecked(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setSelected([]); setChecked(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-8 text-center">
        {item.meaning && <p className="text-muted-foreground">"{item.meaning}"</p>}
        <div className="flex justify-center gap-3 text-2xl font-bold">
          {parts.map((p: string, i: number) => (<button key={i} onClick={() => pick(p)} disabled={checked || selected.includes(p)} className={cn("rounded-xl border-2 px-5 py-3 transition-all", selected.includes(p) ? "border-primary bg-accent" : "hover:border-primary hover:bg-accent")}>{p}</button>))}
        </div>
        <div className={cn("rounded-xl border-2 px-6 py-4 text-3xl font-extrabold min-h-14", checked ? (correct ? "border-emerald-500 text-emerald-600" : "border-destructive text-destructive") : "border-dashed")}>{built || "…"}</div>
        {checked && !correct && <p className="text-sm text-destructive">Answer: <strong>{answer}</strong></p>}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => { setSelected([]); setChecked(false); }}><RotateCcw /></Button>
          {!checked && selected.length === 2 ? <Button onClick={check}>Check</Button> : null}
          {checked && <Button onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
        </div>
      </CardContent></Card>
    </GameShell>
  );
}
