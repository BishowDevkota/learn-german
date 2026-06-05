"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeSession } from "@/lib/actions/play";

/** XP awarded per correct answer, by game difficulty. */
const XP_PER_CORRECT: Record<string, number> = {
  beginner: 10,
  intermediate: 15,
  advanced: 20,
  mixed: 15,
};

export interface GameSession {
  total: number;
  answered: number;
  correct: number;
  xp: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  perCorrect: number;
  finished: boolean;
  saving: boolean;
  /** Record the outcome of one answer. */
  record: (isCorrect: boolean) => void;
  /** End the round; persists progress + XP when the player is logged in. */
  finish: () => void;
  /** Reset to play again. */
  restart: () => void;
}

/**
 * Shared scoring/session engine for every game. Components call `record(bool)`
 * per answer and `finish()` when the round ends; the hook tracks score, streak
 * and XP, and on finish writes a GameSession + applies gamification (server
 * action `completeSession`).
 */
export function useGameSession(opts: {
  slug: string;
  difficulty: string;
  total: number;
  isAuthed: boolean;
}): GameSession {
  const { slug, difficulty, total, isAuthed } = opts;
  const router = useRouter();
  const perCorrect = XP_PER_CORRECT[difficulty] ?? 10;

  const [answered, setAnswered] = React.useState(0);
  const [correct, setCorrect] = React.useState(0);
  const [xp, setXp] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Refs hold the authoritative totals so `finish()` never reads stale state.
  const correctRef = React.useRef(0);
  const xpRef = React.useRef(0);
  const startRef = React.useRef(Date.now());
  const savedRef = React.useRef(false);

  const record = React.useCallback(
    (isCorrect: boolean) => {
      setAnswered((a) => a + 1);
      if (isCorrect) {
        correctRef.current += 1;
        xpRef.current += perCorrect;
        setCorrect(correctRef.current);
        setXp(xpRef.current);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => (next > b ? next : b));
          return next;
        });
      } else {
        setStreak(0);
      }
    },
    [perCorrect]
  );

  const finish = React.useCallback(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    setFinished(true);
    if (!isAuthed) return;

    setSaving(true);
    completeSession({
      slug,
      correct: correctRef.current,
      total,
      xpEarned: xpRef.current,
      timeSpent: Math.round((Date.now() - startRef.current) / 1000),
    })
      .then((res) => {
        if (res.ok) {
          if (res.leveledUp) toast.success(`Level up! You're now level ${res.newLevel} 🎉`);
          res.unlocked?.forEach((a) => toast.success(`Achievement unlocked: ${a.title} 🏆`));
          router.refresh();
        } else if (res.error) {
          toast.error(res.error);
        }
      })
      .catch(() => toast.error("Couldn't save your progress."))
      .finally(() => setSaving(false));
  }, [isAuthed, slug, total, router]);

  const restart = React.useCallback(() => {
    correctRef.current = 0;
    xpRef.current = 0;
    savedRef.current = false;
    startRef.current = Date.now();
    setAnswered(0);
    setCorrect(0);
    setXp(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    setSaving(false);
  }, []);

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return {
    total,
    answered,
    correct,
    xp,
    streak,
    bestStreak,
    accuracy,
    perCorrect,
    finished,
    saving,
    record,
    finish,
    restart,
  };
}
