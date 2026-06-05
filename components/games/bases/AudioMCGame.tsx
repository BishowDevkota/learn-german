"use client";

import * as React from "react";
import { Volume2, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, shuffle } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/games/shared/game-shell";
import { useGameSession } from "@/components/games/shared/use-game-session";
import { useSessionQueue } from "@/components/games/shared/use-session-queue";
import { GameEmptyState } from "@/components/games/shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;
function getAnswer(item: Item): string {
  return String(item.correctAnswer ?? item.answer ?? item.region ?? item.correct ?? item.transcript ?? "");
}
function buildOptions(item: Item): string[] {
  const answer = getAnswer(item);
  const wrongs: string[] = Array.isArray(item.options) ? item.options : [];
  return shuffle([answer, ...wrongs.filter((o) => o !== answer)]).slice(0, 4);
}

export function AudioMCGame({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "audioItems";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => getAnswer(i));
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const audioUrl: string = item.audioUrl ?? item.audio ?? "";
  const answer = getAnswer(item);
  const options = React.useMemo(() => buildOptions(item), [item]); // eslint-disable-line react-hooks/exhaustive-deps
  const transcript: string = item.transcript ?? "";

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    gameSession.record(opt === answer);
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
      <Card><CardContent className="space-y-6 py-8">
        {audioUrl ? (
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={() => audioRef.current?.play()} variant="secondary">
              <Volume2 /> Play audio
            </Button>
            <audio ref={audioRef} src={audioUrl} preload="auto" />
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {transcript ? `"${transcript}"` : "Answer from context."}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const state = picked ? (opt === answer ? "correct" : opt === picked ? "wrong" : "idle") : "idle";
            return (
              <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
                className={cn("flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left font-medium transition-all",
                  state === "idle" && "hover:border-primary hover:bg-accent",
                  state === "correct" && "border-emerald-500 bg-emerald-500/10",
                  state === "wrong" && "border-destructive bg-destructive/10"
                )}>
                {opt}
                {state === "correct" && <Check className="size-4 text-emerald-500" />}
                {state === "wrong" && <X className="size-4 text-destructive" />}
              </button>
            );
          })}
        </div>
        {picked && (
          <Button className="w-full" onClick={next}>
            {index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight />
          </Button>
        )}
      </CardContent></Card>
    </GameShell>
  );
}
