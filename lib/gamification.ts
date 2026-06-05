import type { Difficulty } from "./validations";

/**
 * Level curve. Level 1 starts at 0 XP. The cumulative XP required to *reach*
 * a level grows super-linearly so each level takes a bit more effort.
 *   L1=0, L2≈100, L3≈282, L4≈519, ...
 */
export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function computeLevel(xp: number): number {
  let level = 1;
  while (xpToReachLevel(level + 1) <= xp) level++;
  return level;
}

/** Progress info toward the next level, for progress bars. */
export function levelProgress(xp: number) {
  const level = computeLevel(xp);
  const current = xpToReachLevel(level);
  const next = xpToReachLevel(level + 1);
  const into = xp - current;
  const span = next - current;
  return {
    level,
    nextLevel: level + 1,
    xpIntoLevel: into,
    xpForLevel: span,
    xpToNext: next - xp,
    percent: span === 0 ? 100 : Math.min(100, Math.round((into / span) * 100)),
  };
}

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  beginner: 10,
  intermediate: 20,
  advanced: 30,
  mixed: 20,
};

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementCriteria =
  | { type: "gamesPlayed"; value: number }
  | { type: "wordsLearned"; value: number }
  | { type: "streak"; value: number }
  | { type: "level"; value: number };

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: BadgeTier;
  criteria: AchievementCriteria;
}

/** Canonical achievements seeded into the DB and checked after each session. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first-game", title: "First Steps", description: "Play your first game", icon: "Sparkles", xpReward: 20, tier: "bronze", criteria: { type: "gamesPlayed", value: 1 } },
  { key: "ten-games", title: "Getting Serious", description: "Play 10 games", icon: "Flame", xpReward: 50, tier: "silver", criteria: { type: "gamesPlayed", value: 10 } },
  { key: "hundred-words", title: "Wordsmith", description: "Learn 100 words", icon: "BookOpen", xpReward: 100, tier: "gold", criteria: { type: "wordsLearned", value: 100 } },
  { key: "seven-day-streak", title: "On Fire", description: "Maintain a 7-day streak", icon: "CalendarCheck", xpReward: 80, tier: "gold", criteria: { type: "streak", value: 7 } },
  { key: "level-ten", title: "German Pro", description: "Reach level 10", icon: "Crown", xpReward: 200, tier: "platinum", criteria: { type: "level", value: 10 } },
];

export interface AchievementCheckStats {
  gamesPlayed: number;
  wordsLearned: number;
  streak: number;
  level: number;
}

export function meetsCriteria(def: AchievementDef, stats: AchievementCheckStats): boolean {
  const { type, value } = def.criteria;
  return stats[type] >= value;
}
