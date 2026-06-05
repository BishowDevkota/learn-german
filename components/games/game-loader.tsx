"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameComponent, GameComponentProps } from "@/lib/games/components";
import type { MCConfig } from "./bases/MCGame";
import type { MatchConfig } from "./bases/MatchGame";
import type { TypeConfig } from "./bases/TypeGame";

function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="mx-auto h-10 w-48" />
    </div>
  );
}

// ─── Base components (loaded once, shared by many games) ────────────────────
const MCGameBase = dynamic(() => import("./bases/MCGame").then((m) => ({ default: m.MCGame })), { ssr: false, loading: Loading });
const MatchGameBase = dynamic(() => import("./bases/MatchGame").then((m) => ({ default: m.MatchGame })), { ssr: false, loading: Loading });
const FillGameBase = dynamic(() => import("./bases/FillGame").then((m) => ({ default: m.FillGame })), { ssr: false, loading: Loading });
const TypeGameBase = dynamic(() => import("./bases/TypeGame").then((m) => ({ default: m.TypeGame })), { ssr: false, loading: Loading });
const AudioMCGameBase = dynamic(() => import("./bases/AudioMCGame").then((m) => ({ default: m.AudioMCGame })), { ssr: false, loading: Loading });
const DragLettersBase = dynamic(() => import("./bases/DragLettersGame").then((m) => ({ default: m.DragLettersGame })), { ssr: false, loading: Loading });
const DragWordsBase = dynamic(() => import("./bases/DragWordsGame").then((m) => ({ default: m.DragWordsGame })), { ssr: false, loading: Loading });

// ─── Adapters ────────────────────────────────────────────────────────────────

function mc(config?: MCConfig): GameComponent {
  return function MCAdapter(props: GameComponentProps) { return <MCGameBase {...props} config={config} />; };
}
function match(config?: MatchConfig): GameComponent {
  return function MatchAdapter(props: GameComponentProps) { return <MatchGameBase {...props} config={config} />; };
}
function type(config?: TypeConfig): GameComponent {
  return function TypeAdapter(props: GameComponentProps) { return <TypeGameBase {...props} config={config} />; };
}
function audioMC(): GameComponent {
  return function AudioMCAdapter(props: GameComponentProps) { return <AudioMCGameBase {...props} />; };
}
function fill(): GameComponent {
  return function FillAdapter(props: GameComponentProps) { return <FillGameBase {...props} />; };
}
function dragLetters(): GameComponent {
  return function DragLettersAdapter(props: GameComponentProps) { return <DragLettersBase {...props} />; };
}
function dragWords(): GameComponent {
  return function DragWordsAdapter(props: GameComponentProps) { return <DragWordsBase {...props} />; };
}

// ─── Unique bespoke games ────────────────────────────────────────────────────
const _FlashcardFlip   = dynamic(() => import("./FlashcardFlip"),      { ssr: false, loading: Loading });
const _PictureVocab    = dynamic(() => import("./PictureVocabulary"),   { ssr: false, loading: Loading });
const _MemoryCards     = dynamic(() => import("./MemoryCardPairs"),     { ssr: false, loading: Loading });
const _WordOfTheDay    = dynamic(() => import("./WordOfTheDay"),        { ssr: false, loading: Loading });
const _CompoundWord    = dynamic(() => import("./CompoundWordBuilder"), { ssr: false, loading: Loading });
const _WordCloudPop    = dynamic(() => import("./WordCloudPop"),        { ssr: false, loading: Loading });
const _Hangman         = dynamic(() => import("./Hangman"),             { ssr: false, loading: Loading });
const _TypingRace      = dynamic(() => import("./TypingSpeedRace"),     { ssr: false, loading: Loading });
const _GenderGuesser   = dynamic(() => import("./GenderGuesser"),       { ssr: false, loading: Loading });
const _GermanWordle    = dynamic(() => import("./GermanWordle"),        { ssr: false, loading: Loading });
const _WordCloudBingo  = dynamic(() => import("./VocabularyBingo"),     { ssr: false, loading: Loading });
const _CategorySort    = dynamic(() => import("./CategorySort"),        { ssr: false, loading: Loading });
const _FalseFriends    = dynamic(() => import("./FalseFriends"),        { ssr: false, loading: Loading });
const _EmojiToWord     = dynamic(() => import("./EmojiToWord"),         { ssr: false, loading: Loading });
const _WordFamilyTree  = dynamic(() => import("./WordFamilyTree"),      { ssr: false, loading: Loading });
const _AnagramSolver   = dynamic(() => import("./AnagramSolver"),       { ssr: false, loading: Loading });
const _WordSnake       = dynamic(() => import("./WordSnake"),           { ssr: false, loading: Loading });
const _WordLadder      = dynamic(() => import("./WordLadder"),          { ssr: false, loading: Loading });
const _CompoundBuilder = dynamic(() => import("./CompoundWordBuilder"), { ssr: false, loading: Loading });
const _TwentyQ         = dynamic(() => import("./TwentyQuestionsGerman"), { ssr: false, loading: Loading });

// ─── Full slug → component registry (all 97 games) ─────────────────────────
export const GAME_COMPONENTS: Record<string, GameComponent> = {
  // ── Vocabulary & Recognition ──────────────────────────────────────────────
  "flashcard-flip":         _FlashcardFlip,
  "word-match":             match({ aKey: "german", bKey: "english" }),
  "picture-vocabulary":     _PictureVocab,
  "memory-card-pairs":      _MemoryCards,
  "word-of-the-day":        _WordOfTheDay,
  "synonym-finder":         match({ aKey: "word", bKey: "synonym" }),
  "antonym-pairs":          match({ aKey: "word", bKey: "antonym" }),
  "word-family-tree":       _WordFamilyTree,
  "compound-word-builder":  _CompoundBuilder,
  "emoji-to-word":          _EmojiToWord,
  "word-cloud-pop":         _WordCloudPop,
  "hidden-word-search":     mc(),  // simplified to MC (admin adds clue→answer)

  // ── Spelling & Writing ────────────────────────────────────────────────────
  "scrambled-letters":      dragLetters(),
  "fill-in-the-blank":      fill(),
  "hangman":                _Hangman,
  "typing-speed-race":      _TypingRace,
  "missing-vowels":         dragLetters(),
  "reverse-spelling":       type({ reverse: true }),
  "ghost-writer":           type({ partial: true }),
  "letter-drop":            dragLetters(),  // simplified
  "crossword-puzzle":       mc(),           // simplified to MC
  "word-jumble-sentence":   dragWords(),

  // ── Grammar & Structure ───────────────────────────────────────────────────
  "gender-guesser":         _GenderGuesser,
  "sentence-builder":       dragWords(),
  "conjugation-quiz":       type(),
  "plural-panic":           type(),
  "case-challenge":         mc(),
  "adjective-endings":      fill(),
  "preposition-picker":     fill(),
  "tense-transformer":      type(),
  "modal-verb-mixer":       fill(),
  "negation-game":          fill(),
  "word-order-fixer":       dragWords(),
  "separable-verb-splitter": mc(),

  // ── Listening & Audio ─────────────────────────────────────────────────────
  "listen-and-choose":      audioMC(),
  "dictation-drop":         type(),
  "odd-one-out-audio":      audioMC(),
  "rhyme-finder":           match({ aKey: "word", bKey: "rhyme" }),
  "slow-to-fast-listening": audioMC(),
  "minimal-pairs":          audioMC(),
  "tone-and-stress-quiz":   mc(),
  "song-lyrics-fill-in":    fill(),
  "dialogue-listen":        audioMC(),
  "accent-detective":       audioMC(),

  // ── Speed & Challenge ─────────────────────────────────────────────────────
  "speed-translation":      mc({ mode: "timer", timerSeconds: 5 }),
  "word-ladder":            _WordLadder,
  "true-or-false":          mc({ mode: "true-false" }),
  "beat-the-clock-vocab":   mc({ mode: "timer", timerSeconds: 8 }),
  "streak-challenge":       mc(),
  "lightning-round":        mc({ mode: "lightning", timerSeconds: 3 }),
  "sudden-death":           mc({ mode: "sudden-death" }),
  "multiplier-madness":     mc(),
  "boss-battle":            mc({ mode: "boss" }),
  "daily-duel":             mc({ mode: "timer", timerSeconds: 6 }),

  // ── Context & Culture ─────────────────────────────────────────────────────
  "sentence-translator":    match({ aKey: "german", bKey: "english" }),
  "idiom-guesser":          mc(),
  "number-date-quiz":       mc(),
  "category-sort":          _CategorySort,
  "story-builder":          fill(),
  "proverb-match":          match({ aKey: "german", bKey: "equivalent" }),
  "false-friends":          _FalseFriends,
  "cultural-trivia":        mc(),
  "regional-dialect-quiz":  mc(),
  "formal-vs-informal":     mc(),

  // ── Mini Adventure & Roleplay ─────────────────────────────────────────────
  "cafe-roleplay":          mc(),
  "train-station-quest":    mc(),
  "job-interview-simulator": mc(),
  "market-haggler":         mc(),
  "doctors-office":         mc(),
  "city-explorer":          mc(),
  "escape-room":            type(),
  "text-adventure":         mc(),
  "time-machine":           mc(),
  "pen-pal-simulator":      mc(),

  // ── Puzzle & Logic ────────────────────────────────────────────────────────
  "word-sudoku":            mc(),     // simplified
  "anagram-solver":         _AnagramSolver,
  "word-snake":             _WordSnake,
  "vocabulary-bingo":       _WordCloudBingo,
  "twenty-questions-german": _TwentyQ,
  "riddle-me-this":         type(),
  "connect-four-words":     mc(),
  "german-wordle":          _GermanWordle,
  "vocabulary-tetris":      match({ aKey: "german", bKey: "english" }),

  // ── Reading & Comprehension ───────────────────────────────────────────────
  "short-story-quiz":       mc(),
  "headline-decoder":       mc(),
  "menu-reader":            mc(),
  "letter-decoder":         mc(),
  "comic-strip":            mc(),
  "recipe-translator":      match({ aKey: "step", bKey: "translation" }),
  "sign-language":          mc(),

  // ── Social & Competitive ─────────────────────────────────────────────────
  "leaderboard-sprint":     mc({ mode: "timer", timerSeconds: 6 }),
  "friend-challenge":       mc(),
  "team-quiz":              mc(),
  "tournament-bracket":     mc(),
  "classroom-mode":         mc(),
  "versus-battle":          mc({ mode: "timer", timerSeconds: 4 }),
  "weekly-challenge":       mc(),
};

export function GameLoader(props: GameComponentProps) {
  const Cmp = GAME_COMPONENTS[props.slug];
  if (!Cmp) return null;
  return <Cmp {...props} />;
}
