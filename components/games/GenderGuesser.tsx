"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
const ARTICLES = ["der", "die", "das"] as const;
type Article = (typeof ARTICLES)[number];
const COLORS: Record<Article, string> = { der: "text-sky-500", die: "text-rose-500", das: "text-emerald-500" };

export default function GenderGuesser({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "nouns";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.noun && i?.article);
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<Article | null>(null);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const correct = item.article as Article;

  function pick(art: Article) {
    if (picked) return;
    setPicked(art);
    gameSession.record(art === correct);
    setTimeout(next, 900);
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
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div key={`${session}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card p-10 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">What is the article?</p>
            <p className="mt-4 text-5xl font-extrabold">{item.noun}</p>
            {item.meaning && <p className="text-muted-foreground mt-1">({item.meaning})</p>}
            {picked && <p className={cn("mt-4 text-2xl font-bold", COLORS[correct])}>{correct} {item.noun}</p>}
          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-3 gap-3">
          {ARTICLES.map((art) => (
            <button key={art} onClick={() => pick(art)} disabled={!!picked}
              className={cn("h-16 rounded-xl border-2 text-xl font-extrabold transition-all", COLORS[art],
                picked ? art === correct ? "border-current bg-current/10 scale-105" : art === picked ? "border-destructive opacity-60" : "opacity-30"
                : "hover:border-current hover:bg-current/10"
              )}>{art}</button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
