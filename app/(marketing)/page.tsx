import Link from "next/link";
import { ArrowRight, Trophy, Flame, Sparkles, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { CATEGORIES, GAMES, gameCountByCategory } from "@/lib/games";

const FEATURES = [
  { icon: Gamepad2, title: "97 Interactive Games", desc: "From flashcards to boss battles — ten categories that make learning German feel like play." },
  { icon: Flame, title: "Streaks & XP", desc: "Build daily streaks, earn XP, and level up as you master new words." },
  { icon: Trophy, title: "Leaderboards", desc: "Compete with learners worldwide on global, weekly, and monthly boards." },
];

export default function HomePage() {
  const counts = gameCountByCategory();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/10 via-background to-background" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" /> Learn German through play
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Master German, one{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">game</span>{" "}
            at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {GAMES.length} addictive mini-games across {CATEGORIES.length} categories, real progress
            tracking, and a leaderboard that keeps you coming back. Free to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Start learning free <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/games">Browse games</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <div className="mb-3 grid size-11 place-items-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">Explore by category</h2>
          <p className="text-muted-foreground">Ten ways to level up your German.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.key} href={`/games/${c.key}`} className="group block">
              <div className="flex h-full items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", c.gradient)}>
                  <Icon name={c.icon} className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-primary">{c.title}</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{counts[c.key] ?? 0}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
