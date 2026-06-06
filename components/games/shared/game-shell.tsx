"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy, Flame, Zap, Gamepad2, Home, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Confetti } from "./confetti";
import type { GameSession } from "./use-game-session";

export interface SessionInfo {
  current: number;
  total: number;
  poolSize: number;
  shownSoFar: number;
}

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
  onNextSession?: () => void;
  sessionInfo?: SessionInfo;
  children: React.ReactNode;
}) {
  const progress = session.total > 0 ? (session.answered / session.total) * 100 : 0;
  const si = sessionInfo;

  if (session.finished) {
    const pct = session.accuracy;
    const medal = pct >= 90 ? "🥇" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "📖";
    const poolDone = si && si.shownSoFar >= si.poolSize;
    const nextSession = si ? si.current + 1 : undefined;
    const nextLabel = poolDone
      ? "Restart — reshuffled!"
      : nextSession
      ? `Continue → Session ${nextSession}`
      : "Play again";
    const nextRange = si && !poolDone
      ? `Q ${si.shownSoFar + 1}–${Math.min(si.shownSoFar + 10, si.poolSize)}`
      : si && poolDone ? "All done! 🔄" : undefined;

    return (
      <>
        <Confetti />
        <Card className="overflow-hidden">
          {/* Header band */}
          <div className="border-b bg-gradient-to-r from-emerald-500/20 to-sky-500/20 px-4 py-5 text-center sm:px-6">
            <span className="text-4xl">{medal}</span>
            <h2 className="mt-1 text-lg font-extrabold sm:text-xl">
              {si ? `Session ${si.current} Complete!` : "Round complete!"}
            </h2>
            {si && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {si.shownSoFar} of {si.poolSize} questions seen this cycle
              </p>
            )}
          </div>

          <CardContent className="space-y-5 px-4 py-6 sm:px-6">
            {/* Stats — 2-col on mobile, 4-col on sm */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <Stat label="Correct" value={`${session.correct}/${session.total}`} />
              <Stat label="Accuracy" value={`${pct}%`} />
              <Stat label="Best streak" value={String(session.bestStreak)} />
              <Stat label="XP earned" value={`+${session.xp}`} />
            </div>

            {!isAuthed && (
              <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                <strong>Log in</strong> to save XP and track progress.
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
              {/* Primary: Continue */}
              {onNextSession && (
                <Button
                  className="h-12 w-full text-base"
                  onClick={onNextSession}
                  disabled={session.saving}
                >
                  <Play className="size-4 shrink-0" />
                  <span className="truncate">{nextLabel}</span>
                  {nextRange && (
                    <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                      {nextRange}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Secondary: More games */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={categoryHref}>
                  <Gamepad2 className="size-4 shrink-0" />
                  More games in this category
                </Link>
              </Button>

              {/* Tertiary: All games */}
              <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                <Link href="/games">
                  <Home className="size-4 shrink-0" />
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
    <div className="space-y-3">
      {/* Header bar — compact on mobile */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {si
            ? <><span className="font-medium">S{si.current}</span> · Q {session.answered + 1}/{session.total}</>
            : `${session.answered} / ${session.total}`}
        </span>
        <div className="flex items-center gap-2.5">
          {session.streak > 1 && (
            <span className="flex items-center gap-1 font-medium text-orange-500">
              <Flame className="size-3.5" /> {session.streak}
            </span>
          )}
          <span className="flex items-center gap-1 font-medium text-primary">
            <Zap className="size-3.5" /> {session.xp}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-2.5 text-center sm:p-3">
      <p className="text-base font-bold sm:text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
