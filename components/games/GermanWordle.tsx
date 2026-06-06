"use client";

import * as React from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { GameShell } from "./shared/game-shell";
import { useGameSession } from "./shared/use-game-session";
import { useSessionQueue } from "./shared/use-session-queue";
import { GameEmptyState } from "./shared/empty-state";
import type { GameComponentProps } from "@/lib/games/components";

type LetterState = "correct" | "present" | "absent" | "empty";

function evaluate(guess: string, answer: string): LetterState[] {
  const res: LetterState[] = Array(5).fill("absent");
  const left = answer.split("");
  guess.split("").forEach((l, i) => { if (l === answer[i]) { res[i] = "correct"; left[i] = ""; } });
  guess.split("").forEach((l, i) => { if (res[i] === "correct") return; const idx = left.indexOf(l); if (idx !== -1) { res[i] = "present"; left[idx] = ""; } });
  return res;
}
const KEYBOARD = ["QWERTZUIOP", "ASDFGHJKL", "YXCVBNM"];

export default function GermanWordle({ slug, difficulty, content, isAuthed }: GameComponentProps) {
  const def = getGame(slug);
  const allWords = React.useMemo<string[]>(() => {
    const key = def?.itemsKey ?? "items";
    const raw = Array.isArray(content?.[key]) ? content[key] : [];
    return raw.map((i: { word?: string }) => i?.word?.toUpperCase()).filter((w): w is string => !!w && w.length === 5);
  }, [content, def]);

  const { sessionItems: sessionWords, session, totalSessions, poolSize, shownSoFar, nextSession } = useSessionQueue(allWords);
  const gameSession = useGameSession({ slug, difficulty, total: sessionWords.length, isAuthed });
  const categoryHref = `/games/${def?.category ?? ""}`;

  const [wordIdx, setWordIdx] = React.useState(0);
  const [guesses, setGuesses] = React.useState<string[]>([]);
  const [current, setCurrent] = React.useState("");
  const [done, setDone] = React.useState(false);

  if (allWords.length === 0) return <GameEmptyState message="No 5-letter words yet. Add some in the admin." />;
  const answer = sessionWords[wordIdx] ?? sessionWords[0];

  function press(letter: string) { if (done || current.length >= 5) return; setCurrent((c) => c + letter); }
  function backspace() { if (!done) setCurrent((c) => c.slice(0, -1)); }
  function submit() {
    if (current.length !== 5 || done) return;
    const next = [...guesses, current];
    setGuesses(next);
    const won = current === answer;
    const lost = !won && next.length >= 6;
    if (won || lost) { gameSession.record(won); setDone(true); }
    setCurrent("");
  }
  function nextWord() {
    if (wordIdx + 1 >= sessionWords.length) { gameSession.finish(); return; }
    setWordIdx((i) => i + 1); setGuesses([]); setCurrent(""); setDone(false);
  }
  function handleNextSession() {
    nextSession(); gameSession.restart();
    setWordIdx(0); setGuesses([]); setCurrent(""); setDone(false);
  }

  const letterStates = React.useMemo(() => {
    const m: Record<string, LetterState> = {};
    guesses.forEach((g) => evaluate(g, answer).forEach((s, i) => {
      const l = g[i];
      if (s === "correct" || (s === "present" && m[l] !== "correct") || (!m[l] && s === "absent")) m[l] = s;
    }));
    return m;
  }, [guesses, answer]);

  const rows = Array.from({ length: 6 }, (_, i) => guesses[i] ?? (i === guesses.length && !done ? current : ""));

  return (
    <GameShell session={gameSession} categoryHref={categoryHref} isAuthed={isAuthed}
      sessionInfo={{ current: session, total: totalSessions, poolSize, shownSoFar }}
      onNextSession={handleNextSession}>
      <div className="space-y-4">
        <div className="mx-auto w-fit space-y-1">
          {rows.map((row, ri) => {
            const states = ri < guesses.length ? evaluate(row.padEnd(5), answer) : [];
            return (
              <div key={ri} className="flex gap-1">
                {Array.from({ length: 5 }, (_, ci) => {
                  const letter = row[ci] ?? "";
                  const state = states[ci] ?? "empty";
                  return (
                    <div key={ci} className={cn("flex h-11 w-11 items-center justify-center rounded-lg border-2 text-base font-extrabold uppercase transition-all sm:h-14 sm:w-14 sm:text-xl",
                      state === "correct" && "bg-emerald-500 border-emerald-500 text-white",
                      state === "present" && "bg-amber-500 border-amber-500 text-white",
                      state === "absent" && ri < guesses.length && "bg-muted border-muted text-muted-foreground",
                      state === "empty" && letter && "border-primary",
                      state === "empty" && !letter && "border-border"
                    )}>{letter}</div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {done && (
          <div className="text-center">
            <p className={guesses[guesses.length - 1] === answer ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
              {guesses[guesses.length - 1] === answer ? "Brilliant!" : `Answer: ${answer}`}
            </p>
            <Button className="mt-3" onClick={nextWord}>{wordIdx + 1 >= sessionWords.length ? "Finish session" : "Next word"}</Button>
          </div>
        )}
        {!done && (
          <div className="space-y-1">
            {KEYBOARD.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-0.5 sm:gap-1">
                {ri === 2 && <Button size="sm" onClick={submit} className="h-8 px-2 text-[10px] sm:h-9 sm:px-3 sm:text-xs">ENTER</Button>}
                {row.split("").map((l) => (
                  <button key={l} onClick={() => press(l)}
                    className={cn("h-8 w-7 rounded border text-[10px] font-bold uppercase sm:h-9 sm:w-8 sm:text-xs",
                      letterStates[l] === "correct" && "bg-emerald-500 text-white border-emerald-500",
                      letterStates[l] === "present" && "bg-amber-500 text-white border-amber-500",
                      letterStates[l] === "absent" && "bg-muted text-muted-foreground",
                      !letterStates[l] && "bg-card hover:bg-accent"
                    )}>{l}</button>
                ))}
                {ri === 2 && <button onClick={backspace} className="flex h-8 w-9 items-center justify-center rounded border bg-card hover:bg-accent sm:h-9 sm:w-10"><Delete className="size-3.5" /></button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
}
