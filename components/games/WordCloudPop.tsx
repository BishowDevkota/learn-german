"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
export default function WordCloudPop({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => { const key = def?.itemsKey ?? "rounds"; return (Array.isArray(content?.[key]) ? content[key] : []).filter((r: Item) => r?.prompt && Array.isArray(r?.correct)); }, [content, def]);
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [popped, setPopped] = React.useState<Set<string>>(new Set());
  const [committed, setCommitted] = React.useState(false);
  if (allItems.length === 0) return <GameEmptyState />;
  const round = sessionItems[index] ?? sessionItems[0];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allWords = React.useMemo(() => { const a = [...(round.correct ?? []), ...(round.decoys ?? [])]; return a.sort(() => Math.random() - 0.5); }, [round]);
  const correctSet = new Set<string>(round.correct);
  function pop(word: string) { if (committed) return; setPopped((s) => new Set([...s, word])); }
  function commit() { const ok = [...popped].every((w) => correctSet.has(w)) && correctSet.size === popped.size; gameSession.record(ok); setCommitted(true); }
  function next() { if (index + 1 >= sessionItems.length) { gameSession.finish(); return; } setIndex((i) => i + 1); setPopped(new Set()); setCommitted(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); setIndex(0); setPopped(new Set()); setCommitted(false); }
  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed} sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }} onNextSession={handleNextSession}>
      <div className="space-y-6">
        <p className="text-center text-lg font-semibold">Pop all words in: <span className="text-primary">{round.prompt}</span></p>
        <div className="flex flex-wrap gap-3 justify-center min-h-32 items-center">
          <AnimatePresence>{allWords.map((word: string) => { const isPopped = popped.has(word); const isCorrect = correctSet.has(word); return (
            <motion.button key={word} layout onClick={() => pop(word)} disabled={committed || isPopped}
              initial={{ scale: 1 }} animate={{ scale: isPopped ? 0 : 1 }} transition={{ duration: 0.2 }}
              className={cn("rounded-full border-2 px-4 py-2 font-semibold transition-all", committed && !isPopped && isCorrect && "border-destructive text-destructive", committed && !isPopped && !isCorrect && "opacity-30", !committed && !isPopped && "hover:border-primary hover:bg-accent")}>
              {word}
            </motion.button>
          ); })}</AnimatePresence>
        </div>
        {!committed ? <Button className="w-full" onClick={commit} disabled={popped.size === 0}>Submit</Button>
          : <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next round"}</Button>}
      </div>
    </GameShell>
  );
}
