"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, Flame, Zap, ArrowRight, Gamepad2, Home, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "./confetti";
import type { GameSession } from "./use-game-session";

export interface SessionInfo {
  /** Current session (1-based). */
  current: number;
  /** Total sessions in this pool. */
  total: number;
  /** Total questions in the pool. */
  poolSize: number;
  /** Questions shown so far this cycle (for the subtitle). */
  shownSoFar: number;
}

/**
 * Shared game wrapper: progress bar + streak/XP header during play, and the
 * session-complete result screen.
 *
 * Result screen shows three choices:
 *   1. Continue → next session  (if onNextSession is provided)
 *   2. More games               → categoryHref
 *   3. Browse all games         → /games
 */
export function GameShell({
  session,
  categoryHref,
  isAuthed,
  sessionInfo,
  onNextSession,
  children,
}: {
  session: GameSession;
  categoryHref: string;
  isAuthed: boolean;
  /** Pass to unlock the "Continue → Session N" button. */
  onNextSession?: () => void;
  sessionInfo?: SessionInfo;
  children: React.ReactNode;
}) {
  const progress = session.total > 0 ? (session.answered / session.total) * 100 : 0;
  const si = sessionInfo;

  if (session.finished) {
    const pct = session.accuracy;
    const medal = pct >= 90 ? "🥇" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "📖";
    const nextSession = si ? si.current + 1 : undefined;

    // Has the pool cycled? (shown all questions)
    const poolDone = si && si.shownSoFar >= si.poolSize;
    const nextLabel = poolDone
      ? `Restart (all ${si?.poolSize} questions done!)`
      : nextSession
      ? `Continue → Session ${nextSession}`
      : "Play again";

    // Which questions are next?
    const nextRange =
      si && !poolDone
        ? `Questions ${si.shownSoFar + 1}–${Math.min(si.shownSoFar + 10, si.poolSize)}`
        : si && poolDone
        ? "Starting fresh — reshuffled!"
        : undefined;

    return (
      <>
        <Confetti />
        <Card className="overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border-b px-6 py-4 text-center">
            <span className="text-4xl">{medal}</span>
            <h2 className="mt-1 text-xl font-extrabold">
              {si ? `Session ${si.current} Complete!` : "Round complete!"}
            </h2>
            {si && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {si.shownSoFar} of {si.poolSize} questions seen this cycle
              </p>
            )}
          </div>

          <CardContent className="py-8 space-y-6">
            {/* Score stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Correct" value={`${session.correct}/${session.total}`} />
              <Stat label="Accuracy" value={`${pct}%`} />
              <Stat label="Best streak" value={String(session.bestStreak)} />
              <Stat label="XP earned" value={`+${session.xp}`} />
            </div>

            {!isAuthed && (
              <p className="text-center text-sm text-muted-foreground rounded-lg border border-dashed p-3">
                <strong>Log in</strong> to save your XP and track progress across sessions.
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Primary: Next session */}
              {onNextSession && (
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => { onNextSession(); }}
                  disabled={session.saving}
                >
                  <Play className="size-4" />
                  {nextLabel}
                  {nextRange && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {nextRange}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Secondary: More games in same category */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={categoryHref}>
                  <Gamepad2 className="size-4" />
                  More games in this category
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              {/* Tertiary: Browse all games */}
              <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                <Link href="/games">
                  <Home className="size-4" />
                  Browse all games
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  /* ── Active play UI ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {si
            ? `Q ${session.answered + 1} / ${session.total}  ·  Session ${si.current}`
            : `${session.answered} / ${session.total}`}
        </span>
        <div className="flex items-center gap-3">
          {session.streak > 1 && (
            <span className="flex items-center gap-1 font-medium text-orange-500">
              <Flame className="size-4" /> {session.streak}
            </span>
          )}
          <span className="flex items-center gap-1 font-medium text-primary">
            <Zap className="size-4" /> {session.xp} XP
          </span>
        </div>
      </div>
      <Progress value={progress} />
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
