"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

interface Item { imageUrl?: string; correctWord: string; options?: string[]; }

export default function PictureVocabulary({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const raw = Array.isArray(content?.items) ? (content.items as Item[]) : [];
    return raw.filter((i) => i?.correctWord);
  }, [content]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const choices = React.useMemo(() => shuffle([item.correctWord, ...(item.options ?? [])]), [item]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(choice: string) {
    if (picked || !item) return;
    setPicked(choice);
    gameSession.record(choice === item.correctWord);
  }
  function next() {
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setPicked(null);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setPicked(null);
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <motion.div key={`${session}-${index}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <Card><CardContent className="space-y-6 py-8">
          {item?.imageUrl && (
            <div className="relative mx-auto h-52 w-full max-w-sm overflow-hidden rounded-xl">
              <Image src={item.imageUrl} alt="Guess the word" fill className="object-cover" />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {choices.map((c) => {
              const state = picked ? (c === item?.correctWord ? "correct" : c === picked ? "wrong" : "idle") : "idle";
              return (
                <button key={c} onClick={() => pick(c)} disabled={!!picked}
                  className={cn("flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left font-medium transition-all disabled:cursor-default",
                    state === "idle" && "hover:border-primary hover:bg-accent",
                    state === "correct" && "border-emerald-500 bg-emerald-500/10",
                    state === "wrong" && "border-destructive bg-destructive/10"
                  )}>
                  {c}
                  {state === "correct" && <Check className="size-5 text-emerald-500" />}
                  {state === "wrong" && <X className="size-5 text-destructive" />}
                </button>
              );
            })}
          </div>
          {picked && <Button className="w-full" onClick={next}>{index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight /></Button>}
        </CardContent></Card>
      </motion.div>
    </GameShell>
  );
}
