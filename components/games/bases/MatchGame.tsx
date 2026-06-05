"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

export interface MatchConfig { aKey?: string; bKey?: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pair = Record<string, any>;

const MATCH_BATCH = 6;

export function MatchGame({ slug, difficulty, content, isAuthed, config = {} }: GameComponentProps & { config?: MatchConfig }) {
  const def = getGame(slug);
  const { aKey = "german", bKey = "english" } = config;

  const allPairs = React.useMemo<Pair[]>(() => {
    const key = def?.itemsKey ?? "pairs";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((p: Pair) => p?.[aKey] && p?.[bKey]);
  }, [content, def, aKey, bKey]);

  // Each "session" = SESSION_SIZE questions; but for matching we show MATCH_BATCH at a time.
  // We flatten: one session queue item = one pair. The MATCH_BATCH is internal per-page navigation.
  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allPairs);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [batchOffset, setBatchOffset] = React.useState(0);
  const [matched, setMatched] = React.useState<Set<number>>(new Set());
  const [leftSel, setLeftSel] = React.useState<number | null>(null);
  const [rightSel, setRightSel] = React.useState<number | null>(null);
  const [wrongs, setWrongs] = React.useState<[number, number] | null>(null);

  const batch = sessionItems.slice(batchOffset, batchOffset + MATCH_BATCH);
  const rightItems = React.useMemo(
    () => shuffle(batch.map((p, i) => ({ label: p[bKey], index: i }))),
    [batchOffset, session] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function resetBatch() {
    setMatched(new Set()); setLeftSel(null); setRightSel(null);
  }

  function selectLeft(i: number) {
    if (matched.has(i)) return;
    setLeftSel(i);
    if (rightSel !== null) tryMatch(i, rightSel);
  }
  function selectRight(ri: number) {
    if (matched.has(rightItems[ri].index)) return;
    setRightSel(ri);
    if (leftSel !== null) tryMatch(leftSel, ri);
  }
  function tryMatch(li: number, ri: number) {
    const origIdx = rightItems[ri].index;
    const correct = origIdx === li;
    gameSession.record(correct);
    if (correct) {
      setMatched((m) => new Set([...m, li]));
    } else {
      setWrongs([li, ri]);
      setTimeout(() => setWrongs(null), 600);
    }
    setLeftSel(null); setRightSel(null);
  }

  function nextBatch() {
    const newOffset = batchOffset + MATCH_BATCH;
    if (newOffset >= sessionItems.length) {
      gameSession.finish();
    } else {
      setBatchOffset(newOffset);
      resetBatch();
    }
  }

  function handleNextSession() {
    nextSession();
    gameSession.restart();
    setBatchOffset(0);
    resetBatch();
  }

  if (allPairs.length === 0) return <GameEmptyState />;
  const allMatched = matched.size === batch.length;

  return (
    <GameShell
      session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}
    >
      <Card><CardContent className="py-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {batch.map((p, i) => (
              <button key={i} onClick={() => selectLeft(i)}
                className={cn("w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                  matched.has(i) ? "border-emerald-500 bg-emerald-500/10 line-through text-muted-foreground" :
                  wrongs?.[0] === i ? "border-destructive bg-destructive/10" :
                  leftSel === i ? "border-primary bg-accent" : "hover:border-primary hover:bg-accent"
                )}>
                {matched.has(i) && <Check className="mr-1 inline size-3 text-emerald-500" />}
                {p[aKey]}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems.map(({ label, index: origIdx }, ri) => (
              <button key={ri} onClick={() => selectRight(ri)}
                className={cn("w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                  matched.has(origIdx) ? "border-emerald-500 bg-emerald-500/10 line-through text-muted-foreground" :
                  wrongs?.[1] === ri ? "border-destructive bg-destructive/10" :
                  rightSel === ri ? "border-primary bg-accent" : "hover:border-primary hover:bg-accent"
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {allMatched && (
          <Button className="mt-6 w-full" onClick={nextBatch}>
            {batchOffset + MATCH_BATCH >= sessionItems.length ? "Finish session" : "Next set"}
          </Button>
        )}
      </CardContent></Card>
    </GameShell>
  );
}
