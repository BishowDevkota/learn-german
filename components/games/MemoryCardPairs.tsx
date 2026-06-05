"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
interface Card { id: string; pairId: number; text: string; lang: "de" | "en"; }

export default function MemoryCardPairs({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allPairs = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "pairs";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((p: Item) => p?.german && p?.english);
  }, [content, def]);

  // Memory uses up to 8 pairs per session
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allPairs, 8);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const cards = React.useMemo<Card[]>(() =>
    shuffle(sessionItems.flatMap((p, i) => [
      { id: `de-${session}-${i}`, pairId: i, text: p.german, lang: "de" as const },
      { id: `en-${session}-${i}`, pairId: i, text: p.english, lang: "en" as const },
    ])), [sessionItems, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const [flipped, setFlipped] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [blocked, setBlocked] = React.useState(false);

  function resetBoard() { setFlipped([]); setMatched(new Set()); setBlocked(false); }
  function handleNextSession() { nextSession(); gameSession.restart(); resetBoard(); }

  if (allPairs.length === 0) return <GameEmptyState />;

  function flip(id: string) {
    if (blocked || matched.has(id) || flipped.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setBlocked(true);
      const [a, b] = next.map((x) => cards.find((c) => c.id === x)!);
      if (a.pairId === b.pairId) {
        gameSession.record(true);
        const newMatched = new Set([...matched, a.id, b.id]);
        setMatched(newMatched);
        setFlipped([]);
        setBlocked(false);
        if (newMatched.size >= cards.length) setTimeout(gameSession.finish, 400);
      } else {
        gameSession.record(false);
        setTimeout(() => { setFlipped([]); setBlocked(false); }, 1000);
      }
    }
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.has(card.id);
          return (
            <button key={card.id} onClick={() => flip(card.id)} className="aspect-square [perspective:600px]">
              <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.3 }}
                className="relative h-full w-full [transform-style:preserve-3d]">
                <div className={cn("absolute inset-0 rounded-xl border-2 [backface-visibility:hidden] grid place-items-center font-bold text-lg bg-primary text-primary-foreground", matched.has(card.id) && "bg-emerald-500 border-emerald-500")}>?</div>
                <div className={cn("absolute inset-0 rounded-xl border-2 [backface-visibility:hidden] [transform:rotateY(180deg)] grid place-items-center p-1 text-center text-xs font-semibold bg-card", matched.has(card.id) && "border-emerald-500 bg-emerald-500/10", card.lang === "de" ? "text-primary" : "text-muted-foreground")}>{card.text}</div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
