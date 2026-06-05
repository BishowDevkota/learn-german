import type { Difficulty } from "@/lib/validations";

/**
 * The single source of truth for all 97 games. Each entry carries static
 * metadata (title, category, icon, difficulty) plus a `fields` schema that
 * describes the shape of ONE content item. The freeform `content` on a Game
 * document is `{ [itemsKey]: Item[] }`, and the admin editor renders a
 * repeatable form for `itemNoun`s from `fields`.
 *
 * Image/audio convention: a field of type "image" is stored on the item as
 * `imageUrl` + `imagePublicId`; a field of type "audio" as `audioUrl` +
 * `audioPublicId`. This pairing is what lets Cloudinary stay in sync.
 *
 * The bespoke React component for a game lives at
 * `components/games/<component>.tsx` and is resolved via `lib/games/components`.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "image"
  | "audio"
  | "tags"
  | "boolean";

export interface ItemField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  help?: string;
  /** Render as a column in the admin item table. */
  listColumn?: boolean;
}

export interface GameDefinition {
  slug: string;
  title: string;
  /** category key (see lib/games/categories) */
  category: string;
  difficulty: Difficulty;
  description: string;
  /** lucide-react icon name */
  icon: string;
  /** PascalCase component file under components/games/ */
  component: string;
  /** key under `content` holding the items array */
  itemsKey: string;
  /** singular noun for the admin editor ("card", "pair", "sentence", …) */
  itemNoun: string;
  fields: ItemField[];
}

/* ----------------------------- field helpers ----------------------------- */

const text = (name: string, label: string, o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "text", ...o });
const area = (name: string, label: string, o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "textarea", ...o });
const num = (name: string, label: string, o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "number", ...o });
const tags = (name: string, label: string, o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "tags", ...o });
const sel = (name: string, label: string, options: readonly string[], o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "select", options, ...o });
const bool = (name: string, label: string, o: Partial<ItemField> = {}): ItemField => ({ name, label, type: "boolean", ...o });
const image = (label = "Image", o: Partial<ItemField> = {}): ItemField => ({ name: "image", label, type: "image", ...o });
const audio = (label = "Audio", o: Partial<ItemField> = {}): ItemField => ({ name: "audio", label, type: "audio", ...o });

/** prompt + answer + distractors — the multiple-choice archetype. */
const mc = (promptName: string, promptLabel: string): ItemField[] => [
  text(promptName, promptLabel, { required: true, listColumn: true }),
  text("answer", "Correct Answer", { required: true, listColumn: true }),
  tags("options", "Wrong Options", { help: "Comma-separated distractor answers", listColumn: true }),
];

/** two-column matching archetype. */
const pair = (aName: string, aLabel: string, bName: string, bLabel: string): ItemField[] => [
  text(aName, aLabel, { required: true, listColumn: true }),
  text(bName, bLabel, { required: true, listColumn: true }),
];

/* -------------------------------- registry -------------------------------- */

export const GAMES: GameDefinition[] = [
  /* ===================== Vocabulary & Recognition (12) ===================== */
  { slug: "flashcard-flip", title: "Flashcard Flip", category: "vocabulary", difficulty: "beginner", icon: "Layers", component: "FlashcardFlip",
    description: "Flip 3D cards: German on the front, English + image on the back.",
    itemsKey: "cards", itemNoun: "card",
    fields: [text("german", "German", { required: true, listColumn: true }), text("english", "English", { required: true, listColumn: true }), image("Image (optional)")] },
  { slug: "word-match", title: "Word Match", category: "vocabulary", difficulty: "beginner", icon: "Shuffle", component: "WordMatch",
    description: "Draw lines between German words and their English meanings.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("german", "German", "english", "English") },
  { slug: "picture-vocabulary", title: "Picture Vocabulary", category: "vocabulary", difficulty: "beginner", icon: "Image", component: "PictureVocabulary",
    description: "See an image and pick the correct German word.",
    itemsKey: "items", itemNoun: "item",
    fields: [image("Image", { required: true }), text("correctWord", "Correct Word", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors", listColumn: true })] },
  { slug: "memory-card-pairs", title: "Memory Card Pairs", category: "vocabulary", difficulty: "beginner", icon: "Grid2x2", component: "MemoryCardPairs",
    description: "Flip face-down cards to find matching German/English pairs.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("german", "German", "english", "English") },
  { slug: "word-of-the-day", title: "Word of the Day", category: "vocabulary", difficulty: "beginner", icon: "CalendarDays", component: "WordOfTheDay",
    description: "Learn a word with a usage example, then take a mini quiz.",
    itemsKey: "entries", itemNoun: "word",
    fields: [text("german", "German", { required: true, listColumn: true }), text("english", "English", { required: true, listColumn: true }), area("example", "Example Sentence"), text("exampleTranslation", "Example Translation")] },
  { slug: "synonym-finder", title: "Synonym Finder", category: "vocabulary", difficulty: "intermediate", icon: "Equal", component: "SynonymFinder",
    description: "Match German words with their synonyms.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("word", "Word", "synonym", "Synonym") },
  { slug: "antonym-pairs", title: "Antonym Pairs", category: "vocabulary", difficulty: "intermediate", icon: "ArrowLeftRight", component: "AntonymPairs",
    description: "Match German words with their opposites.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("word", "Word", "antonym", "Antonym") },
  { slug: "word-family-tree", title: "Word Family Tree", category: "vocabulary", difficulty: "advanced", icon: "Network", component: "WordFamilyTree",
    description: "Explore related words branching from a common root.",
    itemsKey: "entries", itemNoun: "family",
    fields: [text("root", "Root Word", { required: true, listColumn: true }), text("meaning", "Root Meaning", { listColumn: true }), tags("members", "Related Words", { help: "Comma-separated related words", listColumn: true })] },
  { slug: "compound-word-builder", title: "Compound Word Builder", category: "vocabulary", difficulty: "intermediate", icon: "Combine", component: "CompoundWordBuilder",
    description: "Drag two word halves together to build a German compound.",
    itemsKey: "items", itemNoun: "compound",
    fields: [text("part1", "First Part", { required: true, listColumn: true }), text("part2", "Second Part", { required: true, listColumn: true }), text("compound", "Compound Word", { required: true, listColumn: true }), text("meaning", "Meaning", { listColumn: true })] },
  { slug: "emoji-to-word", title: "Emoji to Word", category: "vocabulary", difficulty: "beginner", icon: "Smile", component: "EmojiToWord",
    description: "See an emoji and type the matching German word.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("emoji", "Emoji", { required: true, listColumn: true }), text("word", "German Word", { required: true, listColumn: true }), text("english", "English", { listColumn: true })] },
  { slug: "word-cloud-pop", title: "Word Cloud Pop", category: "vocabulary", difficulty: "beginner", icon: "Cloudy", component: "WordCloudPop",
    description: "Pop the bubbles that match the prompt category.",
    itemsKey: "rounds", itemNoun: "round",
    fields: [text("prompt", "Prompt / Category", { required: true, listColumn: true }), tags("correct", "Correct Words", { help: "Words to pop", listColumn: true }), tags("decoys", "Decoy Words", { help: "Words to avoid", listColumn: true })] },
  { slug: "hidden-word-search", title: "Hidden Word Search", category: "vocabulary", difficulty: "intermediate", icon: "Grid3x3", component: "HiddenWordSearch",
    description: "Find hidden German words in a letter grid.",
    itemsKey: "puzzles", itemNoun: "puzzle",
    fields: [tags("words", "Words to Hide", { required: true, help: "Comma-separated words", listColumn: true }), num("gridSize", "Grid Size", { placeholder: "10", listColumn: true })] },

  /* ======================== Spelling & Writing (10) ======================== */
  { slug: "scrambled-letters", title: "Scrambled Letters", category: "spelling", difficulty: "beginner", icon: "Shuffle", component: "ScrambledLetters",
    description: "Drag scrambled letter tiles into the correct order.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("hint", "Hint", { listColumn: true })] },
  { slug: "fill-in-the-blank", title: "Fill in the Blank", category: "spelling", difficulty: "beginner", icon: "FormInput", component: "FillInTheBlank",
    description: "Complete the sentence by filling the missing word.",
    itemsKey: "sentences", itemNoun: "sentence",
    fields: [text("text", "Sentence (use ___ for the blank)", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), text("hint", "Hint"), tags("options", "Options", { help: "Optional multiple-choice options" })] },
  { slug: "hangman", title: "Hangman", category: "spelling", difficulty: "beginner", icon: "Ghost", component: "Hangman",
    description: "Guess the German word one letter at a time.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("hint", "Hint", { required: true, listColumn: true }), text("category", "Category", { listColumn: true })] },
  { slug: "typing-speed-race", title: "Typing Speed Race", category: "spelling", difficulty: "intermediate", icon: "Gauge", component: "TypingSpeedRace",
    description: "Type German phrases to move your racer forward.",
    itemsKey: "items", itemNoun: "phrase",
    fields: [text("phrase", "Phrase", { required: true, listColumn: true }), text("translation", "Translation", { listColumn: true })] },
  { slug: "missing-vowels", title: "Missing Vowels", category: "spelling", difficulty: "beginner", icon: "Eraser", component: "MissingVowels",
    description: "Fill in the missing vowels to complete each word.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("hint", "Hint", { listColumn: true })] },
  { slug: "reverse-spelling", title: "Reverse Spelling", category: "spelling", difficulty: "intermediate", icon: "FlipHorizontal", component: "ReverseSpelling",
    description: "Type the German word spelled backwards.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("meaning", "Meaning", { listColumn: true })] },
  { slug: "ghost-writer", title: "Ghost Writer", category: "spelling", difficulty: "intermediate", icon: "PencilLine", component: "GhostWriter",
    description: "Complete the partially-revealed word.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), num("revealed", "Letters Revealed", { placeholder: "2" }), text("hint", "Hint", { listColumn: true })] },
  { slug: "letter-drop", title: "Letter Drop", category: "spelling", difficulty: "intermediate", icon: "ArrowDownToLine", component: "LetterDrop",
    description: "Catch falling letters to spell the word before it lands.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("meaning", "Meaning", { listColumn: true })] },
  { slug: "crossword-puzzle", title: "Crossword Puzzle", category: "spelling", difficulty: "advanced", icon: "Grid3x3", component: "CrosswordPuzzle",
    description: "Solve an interactive German crossword.",
    itemsKey: "clues", itemNoun: "clue",
    fields: [text("answer", "Answer", { required: true, listColumn: true }), text("clue", "Clue", { required: true, listColumn: true }), sel("direction", "Direction", ["across", "down"], { listColumn: true }), num("row", "Row"), num("col", "Column")] },
  { slug: "word-jumble-sentence", title: "Word Jumble Sentence", category: "spelling", difficulty: "intermediate", icon: "ListOrdered", component: "WordJumbleSentence",
    description: "Drag jumbled words into a correct German sentence.",
    itemsKey: "sentences", itemNoun: "sentence",
    fields: [text("sentence", "Sentence", { required: true, listColumn: true }), text("translation", "Translation", { listColumn: true })] },

  /* ======================= Grammar & Structure (12) ======================= */
  { slug: "gender-guesser", title: "Gender Guesser", category: "grammar", difficulty: "beginner", icon: "Columns3", component: "GenderGuesser",
    description: "Swipe to choose der, die or das for each noun.",
    itemsKey: "nouns", itemNoun: "noun",
    fields: [text("noun", "Noun", { required: true, listColumn: true }), sel("article", "Article", ["der", "die", "das"], { required: true, listColumn: true }), text("meaning", "Meaning", { listColumn: true })] },
  { slug: "sentence-builder", title: "Sentence Builder", category: "grammar", difficulty: "intermediate", icon: "Blocks", component: "SentenceBuilder",
    description: "Drag word tokens into a correct sentence.",
    itemsKey: "sentences", itemNoun: "sentence",
    fields: [text("sentence", "Sentence", { required: true, listColumn: true }), text("translation", "Translation", { listColumn: true }), text("grammarTopic", "Grammar Topic", { listColumn: true })] },
  { slug: "conjugation-quiz", title: "Conjugation Quiz", category: "grammar", difficulty: "intermediate", icon: "Table", component: "ConjugationQuiz",
    description: "Fill in the correct verb conjugation.",
    itemsKey: "items", itemNoun: "conjugation",
    fields: [text("verb", "Verb (infinitive)", { required: true, listColumn: true }), text("pronoun", "Pronoun", { required: true, listColumn: true }), text("answer", "Conjugated Form", { required: true, listColumn: true }), text("tense", "Tense", { listColumn: true })] },
  { slug: "plural-panic", title: "Plural Panic", category: "grammar", difficulty: "intermediate", icon: "CopyPlus", component: "PluralPanic",
    description: "Type the plural form before the timer runs out.",
    itemsKey: "items", itemNoun: "noun",
    fields: [text("singular", "Singular", { required: true, listColumn: true }), text("plural", "Plural", { required: true, listColumn: true })] },
  { slug: "case-challenge", title: "Case Challenge", category: "grammar", difficulty: "advanced", icon: "Layers3", component: "CaseChallenge",
    description: "Identify the grammatical case of the highlighted word.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("sentence", "Sentence", { required: true, listColumn: true }), text("word", "Highlighted Word", { required: true, listColumn: true }), sel("case", "Case", ["Nominativ", "Akkusativ", "Dativ", "Genitiv"], { required: true, listColumn: true })] },
  { slug: "adjective-endings", title: "Adjective Endings", category: "grammar", difficulty: "advanced", icon: "Type", component: "AdjectiveEndings",
    description: "Choose the correct adjective ending.",
    itemsKey: "items", itemNoun: "item", fields: mc("sentence", "Sentence (use ___ )") },
  { slug: "preposition-picker", title: "Preposition Picker", category: "grammar", difficulty: "intermediate", icon: "MapPin", component: "PrepositionPicker",
    description: "Fill the blank with the correct preposition.",
    itemsKey: "sentences", itemNoun: "sentence", fields: mc("text", "Sentence (use ___ )") },
  { slug: "tense-transformer", title: "Tense Transformer", category: "grammar", difficulty: "advanced", icon: "Clock", component: "TenseTransformer",
    description: "Rewrite a sentence in a different tense.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("sentence", "Original Sentence", { required: true, listColumn: true }), text("targetTense", "Target Tense", { required: true, listColumn: true }), text("answer", "Transformed Sentence", { required: true, listColumn: true })] },
  { slug: "modal-verb-mixer", title: "Modal Verb Mixer", category: "grammar", difficulty: "intermediate", icon: "KeyRound", component: "ModalVerbMixer",
    description: "Pick the correct modal verb for the context.",
    itemsKey: "items", itemNoun: "item", fields: mc("sentence", "Sentence (use ___ )") },
  { slug: "negation-game", title: "Negation Game", category: "grammar", difficulty: "intermediate", icon: "Ban", component: "NegationGame",
    description: "Add nicht or kein correctly to the sentence.",
    itemsKey: "items", itemNoun: "item", fields: mc("sentence", "Sentence") },
  { slug: "word-order-fixer", title: "Word Order Fixer", category: "grammar", difficulty: "advanced", icon: "ArrowLeftRight", component: "WordOrderFixer",
    description: "Drag words to fix a broken German sentence.",
    itemsKey: "sentences", itemNoun: "sentence",
    fields: [text("sentence", "Correct Sentence", { required: true, listColumn: true }), text("translation", "Translation", { listColumn: true })] },
  { slug: "separable-verb-splitter", title: "Separable Verb Splitter", category: "grammar", difficulty: "advanced", icon: "Split", component: "SeparableVerbSplitter",
    description: "Identify and split the separable verb correctly.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("sentence", "Sentence", { required: true, listColumn: true }), text("prefix", "Prefix", { required: true, listColumn: true }), text("verb", "Verb Stem", { required: true, listColumn: true })] },

  /* ======================== Listening & Audio (10) ======================== */
  { slug: "listen-and-choose", title: "Listen and Choose", category: "listening", difficulty: "beginner", icon: "Volume2", component: "ListenAndChoose",
    description: "Play the audio and pick the correct option.",
    itemsKey: "audioItems", itemNoun: "clip",
    fields: [audio("Audio", { required: true }), text("correctAnswer", "Correct Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors", listColumn: true })] },
  { slug: "dictation-drop", title: "Dictation Drop", category: "listening", difficulty: "intermediate", icon: "AudioLines", component: "DictationDrop",
    description: "Listen and type exactly what you hear.",
    itemsKey: "audioItems", itemNoun: "clip",
    fields: [audio("Audio", { required: true }), text("transcript", "Transcript", { required: true, listColumn: true })] },
  { slug: "odd-one-out-audio", title: "Odd One Out (Audio)", category: "listening", difficulty: "intermediate", icon: "EarOff", component: "OddOneOutAudio",
    description: "Hear several words and tap the odd one out.",
    itemsKey: "items", itemNoun: "set",
    fields: [tags("words", "Words", { required: true, help: "Comma-separated words", listColumn: true }), text("oddOne", "Odd One Out", { required: true, listColumn: true }), audio("Audio (optional)")] },
  { slug: "rhyme-finder", title: "Rhyme Finder", category: "listening", difficulty: "beginner", icon: "Music", component: "RhymeFinder",
    description: "Match German words that rhyme.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("word", "Word", "rhyme", "Rhyme") },
  { slug: "slow-to-fast-listening", title: "Slow to Fast Listening", category: "listening", difficulty: "advanced", icon: "FastForward", component: "SlowToFastListening",
    description: "Guess the phrase as the playback speed increases.",
    itemsKey: "audioItems", itemNoun: "clip",
    fields: [audio("Audio", { required: true }), text("answer", "Answer", { required: true, listColumn: true })] },
  { slug: "minimal-pairs", title: "Minimal Pairs", category: "listening", difficulty: "advanced", icon: "Ear", component: "MinimalPairs",
    description: "Hear two similar words and spot the difference.",
    itemsKey: "items", itemNoun: "pair",
    fields: [audio("Audio", { required: true }), text("wordA", "Word A", { required: true, listColumn: true }), text("wordB", "Word B", { required: true, listColumn: true }), text("correct", "Which was played?", { required: true, listColumn: true })] },
  { slug: "tone-and-stress-quiz", title: "Tone and Stress Quiz", category: "listening", difficulty: "advanced", icon: "AudioWaveform", component: "ToneAndStressQuiz",
    description: "Click the stressed syllable in each word.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), tags("syllables", "Syllables", { required: true, help: "Comma-separated syllables", listColumn: true }), num("stressedIndex", "Stressed Syllable (0-based)", { required: true }), audio("Audio (optional)")] },
  { slug: "song-lyrics-fill-in", title: "Song Lyrics Fill-In", category: "listening", difficulty: "intermediate", icon: "Mic2", component: "SongLyricsFillIn",
    description: "Fill the missing lyrics as the song plays.",
    itemsKey: "items", itemNoun: "line",
    fields: [audio("Audio (optional)"), text("line", "Lyric Line (use ___ )", { required: true, listColumn: true }), text("answer", "Missing Word", { required: true, listColumn: true }), tags("options", "Options", { help: "Optional choices" })] },
  { slug: "dialogue-listen", title: "Dialogue Listen", category: "listening", difficulty: "advanced", icon: "MessagesSquare", component: "DialogueListen",
    description: "Listen to a conversation and answer questions.",
    itemsKey: "items", itemNoun: "question",
    fields: [audio("Audio", { required: true }), text("question", "Question", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "accent-detective", title: "Accent Detective", category: "listening", difficulty: "advanced", icon: "MapPinned", component: "AccentDetective",
    description: "Identify the regional German accent you hear.",
    itemsKey: "items", itemNoun: "clip",
    fields: [audio("Audio", { required: true }), text("region", "Region", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },

  /* ======================== Speed & Challenge (10) ======================== */
  { slug: "speed-translation", title: "Speed Translation", category: "speed", difficulty: "intermediate", icon: "Zap", component: "SpeedTranslation",
    description: "Translate as fast as you can before the bar empties.",
    itemsKey: "items", itemNoun: "item", fields: pair("prompt", "Prompt", "answer", "Answer") },
  { slug: "word-ladder", title: "Word Ladder", category: "speed", difficulty: "advanced", icon: "ArrowUpDown", component: "WordLadder",
    description: "Change one letter per step to reach the target word.",
    itemsKey: "puzzles", itemNoun: "ladder",
    fields: [text("start", "Start Word", { required: true, listColumn: true }), text("end", "End Word", { required: true, listColumn: true }), tags("steps", "Intermediate Steps", { help: "Ordered comma-separated steps", listColumn: true })] },
  { slug: "true-or-false", title: "True or False", category: "speed", difficulty: "beginner", icon: "ToggleRight", component: "TrueOrFalse",
    description: "Swipe true or false on each translation card.",
    itemsKey: "items", itemNoun: "statement",
    fields: [text("statement", "Statement", { required: true, listColumn: true }), bool("isTrue", "Is it true?", { listColumn: true })] },
  { slug: "beat-the-clock-vocab", title: "Beat the Clock Vocab", category: "speed", difficulty: "intermediate", icon: "AlarmClock", component: "BeatTheClockVocab",
    description: "A 60-second vocabulary sprint.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "streak-challenge", title: "Streak Challenge", category: "speed", difficulty: "intermediate", icon: "Flame", component: "StreakChallenge",
    description: "Keep your streak alive — one wrong answer ends it.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "lightning-round", title: "Lightning Round", category: "speed", difficulty: "advanced", icon: "Bolt", component: "LightningRound",
    description: "Answer 10 questions in 10 seconds.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "sudden-death", title: "Sudden Death", category: "speed", difficulty: "advanced", icon: "Skull", component: "SuddenDeath",
    description: "One strike and you're out.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "multiplier-madness", title: "Multiplier Madness", category: "speed", difficulty: "intermediate", icon: "Asterisk", component: "MultiplierMadness",
    description: "Build a score multiplier with consecutive correct answers.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "boss-battle", title: "Boss Battle", category: "speed", difficulty: "advanced", icon: "Swords", component: "BossBattle",
    description: "Defeat the boss by answering correctly to drain its health.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "daily-duel", title: "Daily Duel", category: "speed", difficulty: "intermediate", icon: "Sword", component: "DailyDuel",
    description: "Compete against yesterday's high score.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },

  /* ======================== Context & Culture (10) ======================== */
  { slug: "sentence-translator", title: "Sentence Translator", category: "culture", difficulty: "intermediate", icon: "Languages", component: "SentenceTranslator",
    description: "Translate a full German sentence.",
    itemsKey: "sentences", itemNoun: "sentence", fields: pair("german", "German", "english", "English") },
  { slug: "idiom-guesser", title: "Idiom Guesser", category: "culture", difficulty: "advanced", icon: "Quote", component: "IdiomGuesser",
    description: "Guess the meaning of a German idiom.",
    itemsKey: "items", itemNoun: "idiom",
    fields: [text("idiom", "Idiom", { required: true, listColumn: true }), text("answer", "Meaning", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "number-date-quiz", title: "Number & Date Quiz", category: "culture", difficulty: "beginner", icon: "Hash", component: "NumberDateQuiz",
    description: "Numbers, dates and times in German.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "category-sort", title: "Category Sort", category: "culture", difficulty: "beginner", icon: "FolderTree", component: "CategorySort",
    description: "Drag words into the correct category buckets.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("bucket", "Category", { required: true, listColumn: true })] },
  { slug: "story-builder", title: "Story Builder", category: "culture", difficulty: "intermediate", icon: "BookText", component: "StoryBuilder",
    description: "Fill the blanks to complete a flowing story.",
    itemsKey: "items", itemNoun: "blank",
    fields: [text("text", "Story Segment (use ___ )", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Options", { help: "Optional choices" })] },
  { slug: "proverb-match", title: "Proverb Match", category: "culture", difficulty: "advanced", icon: "ScrollText", component: "ProverbMatch",
    description: "Match German proverbs to their English equivalents.",
    itemsKey: "pairs", itemNoun: "pair", fields: pair("german", "German Proverb", "equivalent", "English Equivalent") },
  { slug: "false-friends", title: "False Friends", category: "culture", difficulty: "advanced", icon: "UserX", component: "FalseFriends",
    description: "Spot false cognates and learn what they really mean.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("german", "German Word", { required: true, listColumn: true }), text("looksLike", "Looks Like (English)", { required: true, listColumn: true }), text("actualMeaning", "Actual Meaning", { required: true, listColumn: true })] },
  { slug: "cultural-trivia", title: "Cultural Trivia", category: "culture", difficulty: "intermediate", icon: "Landmark", component: "CulturalTrivia",
    description: "Multiple-choice questions about German culture.",
    itemsKey: "items", itemNoun: "question", fields: mc("question", "Question") },
  { slug: "regional-dialect-quiz", title: "Regional Dialect Quiz", category: "culture", difficulty: "advanced", icon: "Map", component: "RegionalDialectQuiz",
    description: "Identify which region a dialect phrase comes from.",
    itemsKey: "items", itemNoun: "phrase",
    fields: [text("phrase", "Dialect Phrase", { required: true, listColumn: true }), text("answer", "Region", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated regions" })] },
  { slug: "formal-vs-informal", title: "Formal vs Informal", category: "culture", difficulty: "beginner", icon: "Handshake", component: "FormalVsInformal",
    description: "Choose du or Sie for each situation.",
    itemsKey: "items", itemNoun: "situation",
    fields: [text("situation", "Situation", { required: true, listColumn: true }), sel("answer", "Correct Form", ["du", "Sie"], { required: true, listColumn: true })] },

  /* ==================== Mini Adventure & Roleplay (10) ==================== */
  { slug: "cafe-roleplay", title: "Café Roleplay", category: "adventure", difficulty: "beginner", icon: "Coffee", component: "CafeRoleplay",
    description: "Order at a German café through interactive dialogue.",
    itemsKey: "steps", itemNoun: "step", fields: mc("prompt", "Prompt / NPC Line") },
  { slug: "train-station-quest", title: "Train Station Quest", category: "adventure", difficulty: "intermediate", icon: "TrainFront", component: "TrainStationQuest",
    description: "Navigate a German train station step by step.",
    itemsKey: "steps", itemNoun: "step", fields: mc("prompt", "Prompt") },
  { slug: "job-interview-simulator", title: "Job Interview Simulator", category: "adventure", difficulty: "advanced", icon: "Briefcase", component: "JobInterviewSimulator",
    description: "Answer interview questions in German.",
    itemsKey: "steps", itemNoun: "question", fields: mc("question", "Interview Question") },
  { slug: "market-haggler", title: "Market Haggler", category: "adventure", difficulty: "intermediate", icon: "ShoppingBasket", component: "MarketHaggler",
    description: "Negotiate prices at a German market.",
    itemsKey: "steps", itemNoun: "step", fields: mc("prompt", "Prompt") },
  { slug: "doctors-office", title: "Doctor's Office", category: "adventure", difficulty: "intermediate", icon: "Stethoscope", component: "DoctorsOffice",
    description: "Describe symptoms to a German doctor.",
    itemsKey: "steps", itemNoun: "step", fields: mc("prompt", "Prompt") },
  { slug: "city-explorer", title: "City Explorer", category: "adventure", difficulty: "beginner", icon: "Building2", component: "CityExplorer",
    description: "Click around a city map and label what you see.",
    itemsKey: "items", itemNoun: "place",
    fields: [image("Image (optional)"), text("label", "Correct Label", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "escape-room", title: "Escape Room", category: "adventure", difficulty: "advanced", icon: "DoorClosed", component: "EscapeRoom",
    description: "Solve German puzzles to unlock each lock and escape.",
    itemsKey: "steps", itemNoun: "puzzle",
    fields: [text("puzzle", "Puzzle / Clue", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), text("hint", "Hint", { listColumn: true })] },
  { slug: "text-adventure", title: "Text Adventure", category: "adventure", difficulty: "advanced", icon: "Footprints", component: "TextAdventure",
    description: "A branching, choice-based German story.",
    itemsKey: "nodes", itemNoun: "scene",
    fields: [area("text", "Scene Text", { required: true }), tags("choices", "Choices", { required: true, help: "Comma-separated choices", listColumn: true }), text("answer", "Best Choice", { required: true, listColumn: true })] },
  { slug: "time-machine", title: "Time Machine", category: "adventure", difficulty: "intermediate", icon: "Hourglass", component: "TimeMachine",
    description: "Travel through eras with period-specific vocabulary.",
    itemsKey: "items", itemNoun: "item",
    fields: [text("era", "Era", { required: true, listColumn: true }), text("prompt", "Prompt", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "pen-pal-simulator", title: "Pen Pal Simulator", category: "adventure", difficulty: "intermediate", icon: "Mail", component: "PenPalSimulator",
    description: "Write replies to a German pen pal.",
    itemsKey: "items", itemNoun: "message", fields: mc("prompt", "Pen Pal Message") },

  /* ========================== Puzzle & Logic (9) ========================== */
  { slug: "word-sudoku", title: "Word Sudoku", category: "puzzle", difficulty: "advanced", icon: "Grid3x3", component: "WordSudoku",
    description: "Fill the grid so each row and column has every word once.",
    itemsKey: "puzzles", itemNoun: "puzzle",
    fields: [tags("words", "Words", { required: true, help: "4 or 6 comma-separated words", listColumn: true }), num("size", "Grid Size", { placeholder: "4", listColumn: true })] },
  { slug: "anagram-solver", title: "Anagram Solver", category: "puzzle", difficulty: "intermediate", icon: "Shuffle", component: "AnagramSolver",
    description: "Unscramble the letters, with a hint if you need it.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "Word", { required: true, listColumn: true }), text("hint", "Hint", { listColumn: true })] },
  { slug: "word-snake", title: "Word Snake", category: "puzzle", difficulty: "intermediate", icon: "Spline", component: "WordSnake",
    description: "Chain words where each starts with the last letter of the previous.",
    itemsKey: "rounds", itemNoun: "round",
    fields: [tags("words", "Word Chain", { required: true, help: "Ordered comma-separated words", listColumn: true })] },
  { slug: "vocabulary-bingo", title: "Vocabulary Bingo", category: "puzzle", difficulty: "beginner", icon: "LayoutGrid", component: "VocabularyBingo",
    description: "Mark the called word on your bingo card.",
    itemsKey: "items", itemNoun: "word", fields: pair("german", "German", "english", "English") },
  { slug: "twenty-questions-german", title: "Twenty Questions", category: "puzzle", difficulty: "advanced", icon: "MessageCircleQuestion", component: "TwentyQuestionsGerman",
    description: "Deduce the secret word from yes/no clues.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("answer", "Secret Word", { required: true, listColumn: true }), tags("clues", "Clues", { required: true, help: "Comma-separated yes/no clues", listColumn: true })] },
  { slug: "riddle-me-this", title: "Riddle Me This", category: "puzzle", difficulty: "advanced", icon: "HelpCircle", component: "RiddleMeThis",
    description: "Solve a German riddle, then reveal the answer.",
    itemsKey: "items", itemNoun: "riddle",
    fields: [area("riddle", "Riddle", { required: true }), text("answer", "Answer", { required: true, listColumn: true }), text("hint", "Hint", { listColumn: true })] },
  { slug: "connect-four-words", title: "Connect Four Words", category: "puzzle", difficulty: "intermediate", icon: "Grip", component: "ConnectFourWords",
    description: "Answer correctly to drop a disc in Connect Four.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "german-wordle", title: "German Wordle", category: "puzzle", difficulty: "advanced", icon: "SquareAsterisk", component: "GermanWordle",
    description: "Guess the 5-letter German word in six tries.",
    itemsKey: "items", itemNoun: "word",
    fields: [text("word", "5-letter Word", { required: true, listColumn: true }), text("meaning", "Meaning", { listColumn: true })] },
  { slug: "vocabulary-tetris", title: "Vocabulary Tetris", category: "puzzle", difficulty: "intermediate", icon: "Blocks", component: "VocabularyTetris",
    description: "Match falling word blocks to their translations.",
    itemsKey: "items", itemNoun: "pair", fields: pair("german", "German", "english", "English") },

  /* ===================== Reading & Comprehension (7) ===================== */
  { slug: "short-story-quiz", title: "Short Story Quiz", category: "reading", difficulty: "intermediate", icon: "BookOpenText", component: "ShortStoryQuiz",
    description: "Read a passage and answer comprehension questions.",
    itemsKey: "items", itemNoun: "question",
    fields: [area("passage", "Passage", { required: true }), text("question", "Question", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "headline-decoder", title: "Headline Decoder", category: "reading", difficulty: "intermediate", icon: "Newspaper", component: "HeadlineDecoder",
    description: "Translate realistic German news headlines.",
    itemsKey: "items", itemNoun: "headline",
    fields: [text("headline", "Headline", { required: true, listColumn: true }), text("answer", "Translation", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "menu-reader", title: "Menu Reader", category: "reading", difficulty: "beginner", icon: "UtensilsCrossed", component: "MenuReader",
    description: "Read a German menu and answer about the dishes.",
    itemsKey: "items", itemNoun: "dish",
    fields: [text("dish", "Dish", { required: true, listColumn: true }), text("answer", "Translation / Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "letter-decoder", title: "Letter Decoder", category: "reading", difficulty: "advanced", icon: "Mail", component: "LetterDecoder",
    description: "Read a personal letter and answer questions.",
    itemsKey: "items", itemNoun: "question",
    fields: [area("letter", "Letter Text", { required: true }), text("question", "Question", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "comic-strip", title: "Comic Strip", category: "reading", difficulty: "beginner", icon: "Image", component: "ComicStrip",
    description: "Fill in the speech bubbles of a comic panel.",
    itemsKey: "items", itemNoun: "panel",
    fields: [image("Panel Image (optional)"), text("prompt", "Bubble Prompt", { required: true, listColumn: true }), text("answer", "Answer", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },
  { slug: "recipe-translator", title: "Recipe Translator", category: "reading", difficulty: "intermediate", icon: "ChefHat", component: "RecipeTranslator",
    description: "Translate a German recipe step by step.",
    itemsKey: "items", itemNoun: "step", fields: pair("step", "German Step", "translation", "Translation") },
  { slug: "sign-language", title: "Sign Reader", category: "reading", difficulty: "beginner", icon: "Signpost", component: "SignLanguage",
    description: "Read German public signs and pick their meaning.",
    itemsKey: "items", itemNoun: "sign",
    fields: [image("Sign Image (optional)"), text("sign", "Sign Text", { required: true, listColumn: true }), text("answer", "Meaning", { required: true, listColumn: true }), tags("options", "Wrong Options", { help: "Comma-separated distractors" })] },

  /* ====================== Social & Competitive (7) ====================== */
  { slug: "leaderboard-sprint", title: "Leaderboard Sprint", category: "social", difficulty: "intermediate", icon: "Trophy", component: "LeaderboardSprint",
    description: "Sprint for points and climb the daily leaderboard.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "friend-challenge", title: "Friend Challenge", category: "social", difficulty: "intermediate", icon: "UserPlus", component: "FriendChallenge",
    description: "Generate a shareable challenge for a friend to beat.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "team-quiz", title: "Team Quiz", category: "social", difficulty: "intermediate", icon: "Users", component: "TeamQuiz",
    description: "Two teams compete to answer the most questions.",
    itemsKey: "items", itemNoun: "question", fields: mc("question", "Question") },
  { slug: "tournament-bracket", title: "Tournament Bracket", category: "social", difficulty: "advanced", icon: "GitBranch", component: "TournamentBracket",
    description: "Battle through bracket rounds to win the tournament.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "classroom-mode", title: "Classroom Mode", category: "social", difficulty: "beginner", icon: "GraduationCap", component: "ClassroomMode",
    description: "Join with a code and play together as a group.",
    itemsKey: "items", itemNoun: "question", fields: mc("question", "Question") },
  { slug: "versus-battle", title: "Versus Battle", category: "social", difficulty: "advanced", icon: "Swords", component: "VersusBattle",
    description: "Head-to-head quiz duel — fastest correct answer wins the round.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
  { slug: "weekly-challenge", title: "Weekly Challenge", category: "social", difficulty: "intermediate", icon: "CalendarClock", component: "WeeklyChallenge",
    description: "A rotating weekly set with a global ranking.",
    itemsKey: "items", itemNoun: "item", fields: mc("prompt", "Prompt") },
];

/* ------------------------------- accessors ------------------------------- */

export const GAME_SLUGS = GAMES.map((g) => g.slug);

export function getGame(slug: string): GameDefinition | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function gamesByCategory(categoryKey: string): GameDefinition[] {
  return GAMES.filter((g) => g.category === categoryKey);
}

/** Number of games per category key, for catalog cards. */
export function gameCountByCategory(): Record<string, number> {
  return GAMES.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});
}

/** Image/audio field names imply paired url + publicId keys on the stored item. */
export function mediaKeys(field: ItemField): { urlKey: string; idKey: string } | null {
  if (field.type === "image") return { urlKey: "imageUrl", idKey: "imagePublicId" };
  if (field.type === "audio") return { urlKey: "audioUrl", idKey: "audioPublicId" };
  return null;
}
