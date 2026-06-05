"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

interface CardItem { german: string; english: string; imageUrl?: string; }

export default function FlashcardFlip({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allCards = React.useMemo<CardItem[]>(() => {
    const raw = Array.isArray(content?.cards) ? (content.cards as CardItem[]) : [];
    return raw.filter((c) => c?.german && c?.english);
  }, [content]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allCards);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  if (allCards.length === 0) return <GameEmptyState />;
  const card = sessionItems[index] ?? sessionItems[0];

  function answer(knew: boolean) {
    gameSession.record(knew);
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setFlipped(false);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setFlipped(false);
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <motion.div key={`${session}-${index}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <button onClick={() => setFlipped((f) => !f)} className="block h-64 w-full [perspective:1200px]" aria-label="Flip card">
          <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : undefined }}>
            {/* Front */}
            <div className="absolute inset-0 grid place-items-center rounded-2xl border bg-card p-6 text-center [backface-visibility:hidden]">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">German</p>
                <p className="mt-2 text-3xl font-bold">{card.german}</p>
                <p className="mt-4 text-xs text-muted-foreground">Tap to flip</p>
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 grid place-items-center rounded-2xl border bg-accent p-6 text-center text-accent-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="space-y-3">
                {card.imageUrl && (
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-lg">
                    <Image src={card.imageUrl} alt={card.english} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-70">English</p>
                  <p className="mt-1 text-2xl font-bold">{card.english}</p>
                </div>
              </div>
            </div>
          </div>
        </button>
        <div className="flex items-center justify-center gap-3">
          {!flipped ? (
            <Button variant="outline" onClick={() => setFlipped(true)}><RefreshCw /> Flip</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => answer(false)}><X /> Missed it</Button>
              <Button onClick={() => answer(true)}><Check /> I knew it</Button>
            </>
          )}
        </div>
      </motion.div>
    </GameShell>
  );
}
