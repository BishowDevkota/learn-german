import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">About LinguaQuest</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          LinguaQuest turns learning German into a game. Instead of memorizing
          endless lists, you play through ten bite-sized games designed to build
          vocabulary, grammar, listening, and pronunciation skills.
        </p>
        <p>
          Every game you play earns XP, builds your daily streak, and moves you up
          the leaderboard. Achievements reward consistency, and the difficulty
          scales as you grow.
        </p>
        <p>
          Built with Next.js, MongoDB, and a love for the German language.
        </p>
      </div>
    </div>
  );
}
