"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/user";
import Achievement from "@/models/achievement";
import GameSession from "@/models/game-session";
import { getGame } from "@/lib/games";
import { computeLevel, ACHIEVEMENTS, meetsCriteria } from "@/lib/gamification";

export interface CompleteSessionInput {
  slug: string;
  correct: number;
  total: number;
  xpEarned: number;
  timeSpent: number;
}

export interface CompleteSessionResult {
  ok: boolean;
  error?: string;
  xpEarned?: number;
  newLevel?: number;
  leveledUp?: boolean;
  unlocked?: { title: string; icon: string; tier: string }[];
}

/** Records a finished game, awards XP, updates streak, and checks achievements. */
export async function completeSession(
  input: CompleteSessionInput
): Promise<CompleteSessionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You must be logged in." };
  if (!getGame(input.slug)) return { ok: false, error: "Unknown game." };

  const xp = Math.max(0, Math.floor(input.xpEarned || 0));

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return { ok: false, error: "User not found." };

  const prevLevel = computeLevel(user.xp);

  // Daily streak: increment if last activity was yesterday, reset if older.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (last) {
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    if (diffDays === 1) user.streak += 1;
    else if (diffDays > 1) user.streak = 1;
    // diffDays === 0 → already played today, keep streak
  } else {
    user.streak = 1;
  }
  user.lastActiveDate = new Date();

  user.xp += xp;
  user.gamesPlayed += 1;
  user.wordsLearned += Math.max(0, input.correct || 0);
  user.level = computeLevel(user.xp);

  // Evaluate achievements not yet unlocked.
  const unlockedKeys = new Set(user.achievements.map((a) => a.key));
  const stats = {
    gamesPlayed: user.gamesPlayed,
    wordsLearned: user.wordsLearned,
    streak: user.streak,
    level: user.level,
  };
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (a) => !unlockedKeys.has(a.key) && meetsCriteria(a, stats)
  );
  for (const a of newlyUnlocked) {
    user.achievements.push({ key: a.key, unlockedAt: new Date() });
    user.xp += a.xpReward;
  }
  if (newlyUnlocked.length) user.level = computeLevel(user.xp);

  await user.save();

  await GameSession.create({
    userId: user._id,
    gameSlug: input.slug,
    score: input.correct,
    xpEarned: xp,
    correct: input.correct,
    total: input.total,
    timeSpent: Math.max(0, Math.floor(input.timeSpent || 0)),
  });

  // Make sure achievement metadata exists in DB (idempotent).
  if (newlyUnlocked.length) {
    await Promise.all(
      newlyUnlocked.map((a) =>
        Achievement.updateOne(
          { key: a.key },
          {
            $setOnInsert: {
              key: a.key,
              title: a.title,
              description: a.description,
              icon: a.icon,
              xpReward: a.xpReward,
              tier: a.tier,
            },
          },
          { upsert: true }
        )
      )
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return {
    ok: true,
    xpEarned: xp,
    newLevel: user.level,
    leveledUp: user.level > prevLevel,
    unlocked: newlyUnlocked.map((a) => ({ title: a.title, icon: a.icon, tier: a.tier })),
  };
}
