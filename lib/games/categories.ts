/**
 * The 10 game categories, in display order. `key` is the URL segment used at
 * /games/[category]. Counts are derived from the game registry, not stored here.
 */
export interface Category {
  key: string;
  title: string;
  /** lucide-react icon name */
  icon: string;
  /** tailwind gradient classes for cards/hero accents */
  gradient: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    key: "vocabulary",
    title: "Vocabulary & Recognition",
    icon: "BookMarked",
    gradient: "from-emerald-500 to-teal-600",
    blurb: "Build your German word bank with flashcards, matching and recall games.",
  },
  {
    key: "spelling",
    title: "Spelling & Writing",
    icon: "PenLine",
    gradient: "from-amber-500 to-orange-600",
    blurb: "Master German spelling, typing and word construction.",
  },
  {
    key: "grammar",
    title: "Grammar & Structure",
    icon: "Blocks",
    gradient: "from-violet-500 to-purple-600",
    blurb: "Genders, cases, conjugation and word order — made playable.",
  },
  {
    key: "listening",
    title: "Listening & Audio",
    icon: "Headphones",
    gradient: "from-cyan-500 to-sky-600",
    blurb: "Train your ear with dictation, minimal pairs and dialogue games.",
  },
  {
    key: "speed",
    title: "Speed & Challenge",
    icon: "Timer",
    gradient: "from-rose-500 to-red-600",
    blurb: "Race the clock, build streaks and beat your high score.",
  },
  {
    key: "culture",
    title: "Context & Culture",
    icon: "Globe",
    gradient: "from-lime-500 to-green-600",
    blurb: "Idioms, proverbs, false friends and German cultural know-how.",
  },
  {
    key: "adventure",
    title: "Mini Adventure & Roleplay",
    icon: "Map",
    gradient: "from-fuchsia-500 to-pink-600",
    blurb: "Cafés, train stations and quests — practise German in real scenarios.",
  },
  {
    key: "puzzle",
    title: "Puzzle & Logic",
    icon: "Puzzle",
    gradient: "from-indigo-500 to-blue-600",
    blurb: "Word sudoku, anagrams, Wordle and brain-bending vocabulary puzzles.",
  },
  {
    key: "reading",
    title: "Reading & Comprehension",
    icon: "BookOpen",
    gradient: "from-orange-500 to-amber-600",
    blurb: "Short stories, menus, headlines and comics with comprehension checks.",
  },
  {
    key: "social",
    title: "Social & Competitive",
    icon: "Trophy",
    gradient: "from-yellow-500 to-amber-600",
    blurb: "Leaderboards, challenges, team modes and tournaments.",
  },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
