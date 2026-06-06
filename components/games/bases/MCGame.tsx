"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ArrowRight, Skull, Swords, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

export type MCMode = "normal" | "timer" | "sudden-death" | "boss" | "lightning" | "true-false";

export interface MCConfig {
  mode?: MCMode;
  timerSeconds?: number;
  bossHp?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

const PROMPT_KEYS = ["prompt", "question", "sentence", "text", "word", "noun",
  "situation", "phrase", "statement", "idiom", "headline", "dish",
  "line", "puzzle", "riddle", "step", "message", "passage", "letter", "sign", "german"];

function getPromptText(item: Item): string {
  for (const k of PROMPT_KEYS) {
    if (item[k] && typeof item[k] === "string") return item[k];
  }
  return Object.values(item).find((v) => v && typeof v === "string") as string ?? "";
}

function getAnswer(item: Item): string {
  if ("isTrue" in item) return item.isTrue ? "True" : "False";
  return String(item.answer ?? item.region ?? item.correct ?? item.article ?? item.case ?? "");
}

function buildOptions(item: Item, mode: MCMode): string[] {
  if (mode === "true-false") return ["True", "False"];
  const answer = getAnswer(item);
  const wrongs: string[] = Array.isArray(item.options) ? item.options :
    (typeof item.options === "string" ? item.options.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
  return shuffle([answer, ...wrongs.filter((o) => o !== answer)]).slice(0, 4);
}

interface MCGameProps extends GameComponentProps {
  config?: MCConfig;
}

export function MCGame({ slug, difficulty, content, isAuthed, config = {} }: MCGameProps) {
  const { mode = "normal", timerSeconds = 8, bossHp = 5 } = config;
  const def = getGame(slug);

  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "items";
    const raw = Array.isArray(content?.[key]) ? content[key] : [];
    return raw.filter((i: Item) => getPromptText(i) || getAnswer(i));
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(timerSeconds);
  const [bossHealth, setBossHealth] = React.useState(bossHp);
  const [playerHealth, setPlayerHealth] = React.useState(3);
  const [dead, setDead] = React.useState(false);

  const item = sessionItems[index];
  const options = React.useMemo(() => (item ? buildOptions(item, mode) : []), [item, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = item ? getAnswer(item) : "";

  // Timer tick
  React.useEffect(() => {
    if (mode !== "timer" || picked || !item) return;
    if (timeLeft <= 0) { autoPick(""); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, picked, item, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lightning auto-advance
  React.useEffect(() => {
    if (mode !== "lightning" || !picked) return;
    const t = setTimeout(advance, 600);
    return () => clearTimeout(t);
  }, [picked]); // eslint-disable-line react-hooks/exhaustive-deps

  function autoPick(choice: string) {
    setPicked(choice || "__timeout__");
    gameSession.record(false);
  }

  function pick(choice: string) {
    if (picked || dead) return;
    const correct = choice === answer;
    setPicked(choice);
    gameSession.record(correct);
    if (mode === "sudden-death" && !correct) { setDead(true); return; }
    if (mode === "boss") {
      if (correct) setBossHealth((h) => Math.max(0, h - 1));
      else setPlayerHealth((h) => Math.max(0, h - 1));
    }
  }

  function advance() {
    if (mode === "boss" && (bossHealth <= 0 || playerHealth <= 0)) { gameSession.finish(); return; }
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1);
    setPicked(null);
    setTimeLeft(timerSeconds);
  }

  function handleNextSession() {
    nextSession();
    gameSession.restart();
    setIndex(0);
    setPicked(null);
    setTimeLeft(timerSeconds);
    setBossHealth(bossHp);
    setPlayerHealth(3);
    setDead(false);
  }

  if (allItems.length === 0) return <GameEmptyState />;

  if (dead) return (
    <Card className="text-center">
      <CardContent className="py-12">
        <Skull className="mx-auto mb-4 size-14 text-destructive" />
        <h2 className="text-2xl font-bold">Eliminated!</h2>
        <p className="mt-2 text-muted-foreground">You got {gameSession.correct} correct.</p>
        <Button className="mt-6" onClick={() => { gameSession.restart(); setIndex(0); setPicked(null); setDead(false); }}>Try again</Button>
      </CardContent>
    </Card>
  );

  return (
    <GameShell
      session={gameSession}
      categoryHref={categoryHref}
      isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}
    >
      {mode === "boss" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-destructive"><Swords className="size-3" /> Boss HP</span>
            <span className="flex items-center gap-1 text-emerald-500"><Zap className="size-3" /> Your HP: {playerHealth}</span>
          </div>
          <Progress value={(bossHealth / bossHp) * 100} className="h-3 [&>div]:bg-destructive" />
        </div>
      )}
      {mode === "timer" && (
        <div className="space-y-1">
          <div className="flex justify-end text-xs text-muted-foreground">{timeLeft}s</div>
          <Progress value={(timeLeft / timerSeconds) * 100} className="h-1.5" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={`${session}-${index}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card>
            <CardContent className="space-y-6 py-8">
              <p className="text-center text-xl font-bold">{getPromptText(item)}</p>

              {mode === "true-false" ? (
                <div className="grid grid-cols-2 gap-4">
                  {["True", "False"].map((opt) => {
                    const state = picked ? (opt === answer ? "correct" : opt === picked ? "wrong" : "idle") : "idle";
                    return (
                      <button key={opt} onClick={() => { pick(opt); if (picked === null) setTimeout(advance, 800); }}
                        disabled={!!picked}
                        className={cn("h-20 rounded-xl border-2 text-lg font-bold transition-all",
                          state === "idle" && "hover:border-primary hover:bg-accent",
                          state === "correct" && "border-emerald-500 bg-emerald-500/10",
                          state === "wrong" && "border-destructive bg-destructive/10"
                        )}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-2 xs:grid-cols-2 sm:gap-3">
                  {options.map((opt) => {
                    const state = picked ? (opt === answer ? "correct" : opt === picked ? "wrong" : "idle") : "idle";
                    return (
                      <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
                        className={cn("flex min-h-[3rem] items-center justify-between rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all disabled:cursor-default sm:px-4 sm:py-3 sm:text-base",
                          state === "idle" && "hover:border-primary hover:bg-accent",
                          state === "correct" && "border-emerald-500 bg-emerald-500/10",
                          state === "wrong" && "border-destructive bg-destructive/10"
                        )}>
                        {opt}
                        {state === "correct" && <Check className="size-4 shrink-0 text-emerald-500" />}
                        {state === "wrong" && <X className="size-4 shrink-0 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {picked && mode !== "lightning" && (
                <Button className="w-full" onClick={advance}>
                  {index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </GameShell>
  );
}
