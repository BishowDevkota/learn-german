"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

const MAX_WRONG = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split("");

function HangmanSVG({ wrong }: { wrong: number }) {
  return (
    <svg viewBox="0 0 120 140" className="mx-auto h-32 w-32 text-foreground" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
      <line x1="10" y1="135" x2="110" y2="135" /><line x1="30" y1="135" x2="30" y2="10" />
      <line x1="30" y1="10" x2="75" y2="10" /><line x1="75" y1="10" x2="75" y2="25" />
      {wrong > 0 && <circle cx="75" cy="33" r="8" />}
      {wrong > 1 && <line x1="75" y1="41" x2="75" y2="80" />}
      {wrong > 2 && <line x1="75" y1="55" x2="55" y2="70" />}
      {wrong > 3 && <line x1="75" y1="55" x2="95" y2="70" />}
      {wrong > 4 && <line x1="75" y1="80" x2="58" y2="100" />}
      {wrong > 5 && <line x1="75" y1="80" x2="92" y2="100" />}
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

export default function Hangman({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allItems = React.useMemo<Item[]>(() => {
    const key = def?.itemsKey ?? "items";
    return (Array.isArray(content?.[key]) ? content[key] : []).filter((i: Item) => i?.word);
  }, [content, def]);

  const { sessionItems, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allItems);
  const gameSession = useGameSession({ slug, difficulty, total: sessionItems.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [index, setIndex] = React.useState(0);
  const [guessed, setGuessed] = React.useState<Set<string>>(new Set());

  if (allItems.length === 0) return <GameEmptyState />;
  const item = sessionItems[index] ?? sessionItems[0];
  const word = (item.word as string).toUpperCase();
  const hint: string = item.hint ?? "";
  const wrong = [...guessed].filter((l) => !word.includes(l)).length;
  const won = word.split("").every((l) => !/[A-ZÄÖÜ]/.test(l) || guessed.has(l));
  const lost = wrong >= MAX_WRONG;
  const done = won || lost;

  function guess(letter: string) {
    if (done || guessed.has(letter)) return;
    const newGuessed = new Set([...guessed, letter]);
    setGuessed(newGuessed);
    const newWrong = [...newGuessed].filter((l) => !word.includes(l)).length;
    const nowWon = word.split("").every((l) => !/[A-ZÄÖÜ]/.test(l) || newGuessed.has(l));
    if (nowWon) gameSession.record(true);
    else if (newWrong >= MAX_WRONG) gameSession.record(false);
  }
  function next() {
    if (index + 1 >= sessionItems.length) { gameSession.finish(); return; }
    setIndex((i) => i + 1); setGuessed(new Set());
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setIndex(0); setGuessed(new Set());
  }

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <Card><CardContent className="space-y-6 py-6">
        <HangmanSVG wrong={wrong} />
        {hint && <p className="text-center text-sm text-muted-foreground">Hint: {hint}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {word.split("").map((letter, i) => (
            <div key={i} className={cn("flex h-10 w-8 items-end justify-center border-b-2 pb-1 text-lg font-bold uppercase",
              /[A-ZÄÖÜ]/.test(letter) ? "border-foreground" : "border-transparent"
            )}>
              {/[A-ZÄÖÜ]/.test(letter) ? (guessed.has(letter) || lost ? letter : "") : letter}
            </div>
          ))}
        </div>
        {lost && <p className="text-center font-semibold text-destructive">The word was: {word}</p>}
        {won && <p className="text-center font-semibold text-emerald-500">Excellent! 🎉</p>}
        {!done ? (
          <div className="flex flex-wrap justify-center gap-1">
            {ALPHABET.map((letter) => (
              <button key={letter} onClick={() => guess(letter)} disabled={guessed.has(letter)}
                className={cn("h-8 w-8 rounded-lg border text-xs font-bold uppercase transition-all sm:h-9 sm:w-9 sm:text-sm",
                  guessed.has(letter)
                    ? (word.includes(letter) ? "bg-emerald-500/20 text-emerald-600 border-emerald-500" : "opacity-25")
                    : "hover:border-primary hover:bg-accent"
                )}>{letter}</button>
            ))}
          </div>
        ) : (
          <Button className="w-full" onClick={next}>
            {index + 1 >= sessionItems.length ? "Finish session" : "Next"} <ArrowRight />
          </Button>
        )}
      </CardContent></Card>
    </GameShell>
  );
}
