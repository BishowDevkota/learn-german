/**
 * Comprehensive beginner German content seed for all 97 games.
 * Covers A1/A2 CEFR level: greetings, numbers, colors, animals, food, family,
 * body parts, clothing, days/months, common verbs, basic grammar, phrases.
 *
 * Run: npx tsx scripts/seed-content.ts
 * (uses $set so it OVERWRITES existing content — safe to re-run)
 */
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import Game from "../models/game";

const mc = (prompt: string, answer: string, options: string[]) => ({ prompt, answer, options });
const pair = (german: string, english: string) => ({ german, english });
const card = (german: string, english: string) => ({ german, english, imageUrl: "", imagePublicId: "" });

// ── Reusable vocab banks ─────────────────────────────────────────────────────

const BASIC_VOCAB_MC = [
  mc("Was bedeutet 'Hund'?", "dog", ["cat", "bird", "horse"]),
  mc("Was bedeutet 'Katze'?", "cat", ["dog", "mouse", "rabbit"]),
  mc("Was bedeutet 'Haus'?", "house", ["car", "tree", "street"]),
  mc("Was bedeutet 'Apfel'?", "apple", ["banana", "bread", "milk"]),
  mc("Was bedeutet 'Buch'?", "book", ["pen", "table", "chair"]),
  mc("Was bedeutet 'Wasser'?", "water", ["milk", "juice", "bread"]),
  mc("Was bedeutet 'Schule'?", "school", ["house", "car", "park"]),
  mc("Was bedeutet 'Freund'?", "friend", ["enemy", "teacher", "doctor"]),
  mc("Was bedeutet 'Sonne'?", "sun", ["moon", "star", "cloud"]),
  mc("Was bedeutet 'Mutter'?", "mother", ["father", "sister", "brother"]),
  mc("Was bedeutet 'Vater'?", "father", ["mother", "son", "uncle"]),
  mc("Was bedeutet 'Kind'?", "child", ["adult", "teacher", "doctor"]),
  mc("Was bedeutet 'Brot'?", "bread", ["butter", "milk", "egg"]),
  mc("Was bedeutet 'Milch'?", "milk", ["water", "juice", "tea"]),
  mc("Was bedeutet 'Tisch'?", "table", ["chair", "bed", "door"]),
  mc("Was bedeutet 'Stuhl'?", "chair", ["table", "bed", "window"]),
  mc("Was bedeutet 'rot'?", "red", ["blue", "green", "yellow"]),
  mc("Was bedeutet 'blau'?", "blue", ["red", "green", "black"]),
  mc("Was bedeutet 'groß'?", "big", ["small", "fast", "old"]),
  mc("Was bedeutet 'klein'?", "small", ["big", "new", "good"]),
  mc("Was bedeutet 'gut'?", "good", ["bad", "fast", "small"]),
  mc("Was bedeutet 'neu'?", "new", ["old", "big", "small"]),
  mc("Was bedeutet 'alt'?", "old", ["new", "young", "fast"]),
  mc("Wie sagt man 'hello' auf Deutsch?", "Hallo", ["Tschüss", "Danke", "Bitte"]),
  mc("Wie sagt man 'goodbye' auf Deutsch?", "Tschüss", ["Hallo", "Bitte", "Ja"]),
  mc("Wie sagt man 'thank you' auf Deutsch?", "Danke", ["Bitte", "Hallo", "Nein"]),
  mc("Wie sagt man 'please' auf Deutsch?", "Bitte", ["Danke", "Ja", "Nein"]),
  mc("Wie sagt man 'yes' auf Deutsch?", "Ja", ["Nein", "Vielleicht", "Danke"]),
  mc("Wie sagt man 'no' auf Deutsch?", "Nein", ["Ja", "Vielleicht", "Bitte"]),
  mc("Was bedeutet 'sprechen'?", "to speak", ["to eat", "to sleep", "to run"]),
];

const GERMAN_PAIRS = [
  pair("der Hund", "dog"), pair("die Katze", "cat"), pair("das Haus", "house"),
  pair("der Apfel", "apple"), pair("die Schule", "school"), pair("das Buch", "book"),
  pair("der Tisch", "table"), pair("die Sonne", "sun"), pair("das Kind", "child"),
  pair("der Vater", "father"), pair("die Mutter", "mother"), pair("der Freund", "friend"),
  pair("das Wasser", "water"), pair("das Brot", "bread"), pair("die Milch", "milk"),
  pair("der Stuhl", "chair"), pair("die Tür", "door"), pair("das Fenster", "window"),
  pair("der Baum", "tree"), pair("die Blume", "flower"),
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONTENT: Record<string, Record<string, any>> = {

  // ══════════════════════════════════════════════════════════════════════════
  //  VOCABULARY & RECOGNITION
  // ══════════════════════════════════════════════════════════════════════════

  "flashcard-flip": {
    cards: [
      card("Hallo", "Hello"), card("Guten Morgen", "Good morning"),
      card("Guten Tag", "Good day"), card("Guten Abend", "Good evening"),
      card("Tschüss", "Goodbye"), card("Danke", "Thank you"),
      card("Bitte", "Please / You're welcome"), card("Entschuldigung", "Excuse me / Sorry"),
      card("der Hund", "dog"), card("die Katze", "cat"),
      card("das Haus", "house"), card("der Apfel", "apple"),
      card("die Schule", "school"), card("das Buch", "book"),
      card("der Tisch", "table"), card("die Sonne", "sun"),
      card("das Kind", "child"), card("der Vater", "father"),
      card("die Mutter", "mother"), card("das Wasser", "water"),
    ],
  },

  "word-match": {
    pairs: [
      pair("der Hund", "dog"), pair("die Katze", "cat"),
      pair("das Haus", "house"), pair("der Apfel", "apple"),
      pair("die Schule", "school"), pair("das Buch", "book"),
      pair("der Tisch", "table"), pair("die Sonne", "sun"),
      pair("das Kind", "child"), pair("das Wasser", "water"),
      pair("der Vater", "father"), pair("die Mutter", "mother"),
      pair("die Blume", "flower"), pair("der Baum", "tree"),
      pair("das Brot", "bread"), pair("die Milch", "milk"),
    ],
  },

  "picture-vocabulary": {
    items: [
      { imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400", imagePublicId: "", correctWord: "der Hund", options: ["die Katze", "das Pferd", "der Vogel"] },
      { imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400", imagePublicId: "", correctWord: "die Katze", options: ["der Hund", "der Fisch", "die Maus"] },
      { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", imagePublicId: "", correctWord: "der Berg", options: ["das Meer", "der Fluss", "die Wüste"] },
      { imageUrl: "https://images.unsplash.com/photo-1560963689-b5682b6440f8?w=400", imagePublicId: "", correctWord: "der Apfel", options: ["die Banane", "die Orange", "die Birne"] },
      { imageUrl: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400", imagePublicId: "", correctWord: "das Brot", options: ["der Käse", "die Butter", "das Ei"] },
      { imageUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400", imagePublicId: "", correctWord: "die Blume", options: ["der Baum", "das Gras", "der Strauch"] },
      { imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400", imagePublicId: "", correctWord: "der Vogel", options: ["der Fisch", "die Schlange", "das Kaninchen"] },
      { imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", imagePublicId: "", correctWord: "das Auto", options: ["der Bus", "das Fahrrad", "der Zug"] },
      { imageUrl: "https://images.unsplash.com/photo-1509833903111-9cb142f644e4?w=400", imagePublicId: "", correctWord: "der Stuhl", options: ["der Tisch", "das Bett", "das Sofa"] },
      { imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", imagePublicId: "", correctWord: "das Buch", options: ["die Zeitung", "das Heft", "das Magazin"] },
    ],
  },

  "memory-card-pairs": {
    pairs: [
      pair("der Hund", "dog"), pair("die Katze", "cat"), pair("das Haus", "house"),
      pair("der Apfel", "apple"), pair("die Schule", "school"), pair("das Buch", "book"),
      pair("der Tisch", "table"), pair("die Sonne", "sun"),
    ],
  },

  "word-of-the-day": {
    entries: [
      { german: "die Freundschaft", english: "friendship", example: "Freundschaft ist sehr wichtig im Leben.", exampleTranslation: "Friendship is very important in life." },
      { german: "der Augenblick", english: "moment / instant", example: "Genieße jeden Augenblick!", exampleTranslation: "Enjoy every moment!" },
      { german: "die Gemütlichkeit", english: "cosiness / comfort", example: "Das Café hat eine tolle Gemütlichkeit.", exampleTranslation: "The café has a wonderful cosiness." },
      { german: "der Fernweh", english: "wanderlust", example: "Ich habe starken Fernweh.", exampleTranslation: "I have a strong wanderlust." },
      { german: "das Heimweh", english: "homesickness", example: "Ich habe Heimweh nach meiner Familie.", exampleTranslation: "I am homesick for my family." },
      { german: "der Weltschmerz", english: "world-weariness / sadness about the state of the world", example: "Er leidet an Weltschmerz.", exampleTranslation: "He suffers from world-weariness." },
      { german: "die Verschlimmbessern", english: "to make something worse while trying to improve it", example: "Pass auf, dass du es nicht verschlimmbesserst!", exampleTranslation: "Be careful you don't make it worse trying to fix it!" },
      { german: "das Fingerspitzengefühl", english: "tact / sensitivity", example: "Die Lehrerin hat viel Fingerspitzengefühl.", exampleTranslation: "The teacher has a lot of tact." },
      { german: "der Frühlingsgefühle", english: "spring feelings / new love feelings", example: "Im April bekommt man Frühlingsgefühle.", exampleTranslation: "In April you get spring feelings." },
      { german: "die Geborgenheit", english: "safety / feeling of security and warmth", example: "Bei meiner Familie fühle ich Geborgenheit.", exampleTranslation: "With my family I feel safe and secure." },
    ],
  },

  "synonym-finder": {
    pairs: [
      { word: "groß", synonym: "riesig" }, { word: "klein", synonym: "winzig" },
      { word: "gut", synonym: "toll" }, { word: "schlecht", synonym: "schlimm" },
      { word: "schön", synonym: "hübsch" }, { word: "kaputt", synonym: "defekt" },
      { word: "schnell", synonym: "rasch" }, { word: "langsam", synonym: "gemächlich" },
      { word: "klug", synonym: "intelligent" }, { word: "müde", synonym: "erschöpft" },
      { word: "anfangen", synonym: "beginnen" }, { word: "schauen", synonym: "gucken" },
    ],
  },

  "antonym-pairs": {
    pairs: [
      { word: "groß", antonym: "klein" }, { word: "gut", antonym: "schlecht" },
      { word: "schnell", antonym: "langsam" }, { word: "alt", antonym: "jung" },
      { word: "heiß", antonym: "kalt" }, { word: "lang", antonym: "kurz" },
      { word: "hell", antonym: "dunkel" }, { word: "laut", antonym: "leise" },
      { word: "oben", antonym: "unten" }, { word: "links", antonym: "rechts" },
      { word: "öffnen", antonym: "schließen" }, { word: "kaufen", antonym: "verkaufen" },
    ],
  },

  "word-family-tree": {
    entries: [
      { root: "schreib-", meaning: "write", members: ["schreiben", "der Schreiber", "die Schrift", "der Schreibtisch", "das Schreiben"] },
      { root: "lern-", meaning: "learn", members: ["lernen", "der Lerner", "das Lernen", "die Lerngruppe", "ungelernter"] },
      { root: "sprech-", meaning: "speak", members: ["sprechen", "die Sprache", "der Sprecher", "das Gespräch", "ansprechen"] },
      { root: "fahr-", meaning: "drive/travel", members: ["fahren", "der Fahrer", "das Fahrzeug", "die Fahrt", "abfahren"] },
      { root: "arbeit-", meaning: "work", members: ["arbeiten", "der Arbeiter", "die Arbeit", "das Büro", "fleißig"] },
      { root: "spiel-", meaning: "play", members: ["spielen", "der Spieler", "das Spiel", "der Spielplatz", "mitspielen"] },
      { root: "koch-", meaning: "cook", members: ["kochen", "der Koch", "die Küche", "das Kochbuch", "mitkochen"] },
      { root: "kauf-", meaning: "buy", members: ["kaufen", "der Käufer", "das Geschäft", "einkaufen", "verkaufen"] },
    ],
  },

  "compound-word-builder": {
    items: [
      { part1: "Haus", part2: "tür", compound: "Haustür", meaning: "front door" },
      { part1: "Hand", part2: "tasche", compound: "Handtasche", meaning: "handbag" },
      { part1: "Schul", part2: "tasche", compound: "Schultasche", meaning: "school bag" },
      { part1: "Buch", part2: "regal", compound: "Bücherregal", meaning: "bookshelf" },
      { part1: "Wohn", part2: "zimmer", compound: "Wohnzimmer", meaning: "living room" },
      { part1: "Schlaf", part2: "zimmer", compound: "Schlafzimmer", meaning: "bedroom" },
      { part1: "Kühl", part2: "schrank", compound: "Kühlschrank", meaning: "refrigerator" },
      { part1: "Zahn", part2: "bürste", compound: "Zahnbürste", meaning: "toothbrush" },
      { part1: "Sonnen", part2: "blume", compound: "Sonnenblume", meaning: "sunflower" },
      { part1: "Erd", part2: "beere", compound: "Erdbeere", meaning: "strawberry" },
    ],
  },

  "emoji-to-word": {
    items: [
      { emoji: "🐕", word: "der Hund", english: "dog" }, { emoji: "🐈", word: "die Katze", english: "cat" },
      { emoji: "🍎", word: "der Apfel", english: "apple" }, { emoji: "🏠", word: "das Haus", english: "house" },
      { emoji: "📚", word: "das Buch", english: "book" }, { emoji: "☀️", word: "die Sonne", english: "sun" },
      { emoji: "🌙", word: "der Mond", english: "moon" }, { emoji: "⭐", word: "der Stern", english: "star" },
      { emoji: "🌧️", word: "der Regen", english: "rain" }, { emoji: "❄️", word: "der Schnee", english: "snow" },
      { emoji: "🌺", word: "die Blume", english: "flower" }, { emoji: "🌲", word: "der Baum", english: "tree" },
      { emoji: "🍞", word: "das Brot", english: "bread" }, { emoji: "🥛", word: "die Milch", english: "milk" },
      { emoji: "🐟", word: "der Fisch", english: "fish" }, { emoji: "🚗", word: "das Auto", english: "car" },
      { emoji: "✈️", word: "das Flugzeug", english: "airplane" }, { emoji: "🚂", word: "der Zug", english: "train" },
      { emoji: "⌚", word: "die Uhr", english: "clock/watch" }, { emoji: "📱", word: "das Handy", english: "mobile phone" },
    ],
  },

  "word-cloud-pop": {
    rounds: [
      { prompt: "Tiere (Animals)", correct: ["Hund", "Katze", "Vogel", "Fisch", "Pferd"], decoys: ["Apfel", "Tisch", "rot", "schnell", "Schule"] },
      { prompt: "Farben (Colors)", correct: ["rot", "blau", "grün", "gelb", "schwarz"], decoys: ["Hund", "Haus", "essen", "groß", "Tisch"] },
      { prompt: "Essen (Food)", correct: ["Brot", "Apfel", "Milch", "Käse", "Ei"], decoys: ["Hund", "Blume", "rot", "gehen", "Buch"] },
      { prompt: "Familie (Family)", correct: ["Mutter", "Vater", "Bruder", "Schwester", "Oma"], decoys: ["Apfel", "Tisch", "blau", "schlafen", "Hund"] },
      { prompt: "Verben (Verbs)", correct: ["essen", "trinken", "schlafen", "gehen", "spielen"], decoys: ["Hund", "rot", "Tisch", "Apfel", "groß"] },
      { prompt: "Möbel (Furniture)", correct: ["Tisch", "Stuhl", "Bett", "Sofa", "Schrank"], decoys: ["Hund", "Apfel", "rot", "schnell", "Regen"] },
      { prompt: "Kleidung (Clothing)", correct: ["Hemd", "Hose", "Schuhe", "Jacke", "Mütze"], decoys: ["Tisch", "Hund", "grün", "essen", "Mond"] },
      { prompt: "Körperteile (Body parts)", correct: ["Kopf", "Hand", "Fuß", "Auge", "Nase"], decoys: ["Apfel", "Tisch", "blau", "Schule", "Hund"] },
    ],
  },

  "hidden-word-search": {
    puzzles: [
      { words: ["HUND", "KATZE", "VOGEL", "FISCH", "PFERD"], gridSize: 10 },
      { words: ["ROT", "BLAU", "GRUEN", "GELB", "SCHWARZ"], gridSize: 10 },
      { words: ["APFEL", "BROT", "MILCH", "KAESE", "EI"], gridSize: 10 },
      { words: ["MUTTER", "VATER", "BRUDER", "SCHWESTER", "OMA"], gridSize: 10 },
      { words: ["TISCH", "STUHL", "BETT", "SOFA", "LAMPE"], gridSize: 10 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SPELLING & WRITING
  // ══════════════════════════════════════════════════════════════════════════

  "scrambled-letters": {
    items: [
      { word: "Hund", hint: "Ein Haustier, bellt" }, { word: "Katze", hint: "Ein Haustier, miaut" },
      { word: "Haus", hint: "Man wohnt darin" }, { word: "Apfel", hint: "Rotes Obst" },
      { word: "Schule", hint: "Wo man lernt" }, { word: "Buch", hint: "Zum Lesen" },
      { word: "Tisch", hint: "Möbelstück mit 4 Beinen" }, { word: "Blume", hint: "Schöne Pflanze" },
      { word: "Baum", hint: "Große Pflanze im Garten" }, { word: "Regen", hint: "Wasser vom Himmel" },
      { word: "Sonne", hint: "Strahlt am Tag" }, { word: "Mond", hint: "Leuchtet in der Nacht" },
      { word: "Brot", hint: "Man isst es zum Frühstück" }, { word: "Milch", hint: "Weißes Getränk" },
      { word: "Wasser", hint: "Man trinkt es täglich" },
    ],
  },

  "fill-in-the-blank": {
    sentences: [
      { text: "Ich ___ ein Buch.", answer: "lese", hint: "verb: to read", options: ["lese", "esse", "trinke", "schlafe"] },
      { text: "Wir ___ in die Schule.", answer: "gehen", hint: "verb: to go", options: ["gehen", "essen", "schlafen", "spielen"] },
      { text: "Er ___ einen Hund.", answer: "hat", hint: "verb: to have", options: ["hat", "ist", "macht", "geht"] },
      { text: "Das Wetter ist ___.", answer: "schön", hint: "adjective: beautiful", options: ["schön", "groß", "schnell", "alt"] },
      { text: "Ich ___ Deutsch.", answer: "lerne", hint: "verb: to learn", options: ["lerne", "esse", "schlafe", "gehe"] },
      { text: "Die Katze ___ auf dem Tisch.", answer: "sitzt", hint: "verb: to sit", options: ["sitzt", "geht", "isst", "schläft"] },
      { text: "___ heißt du?", answer: "Wie", hint: "question word: how/what (name)", options: ["Wie", "Was", "Wo", "Wann"] },
      { text: "___ kommst du?", answer: "Woher", hint: "question word: where from", options: ["Woher", "Wohin", "Wann", "Warum"] },
      { text: "Ich ___ müde.", answer: "bin", hint: "verb: to be (ich)", options: ["bin", "habe", "mache", "gehe"] },
      { text: "Das Haus ist ___.", answer: "groß", hint: "adjective: big", options: ["groß", "schnell", "alt", "neu"] },
      { text: "Wir ___ Pizza.", answer: "essen", hint: "verb: to eat", options: ["essen", "trinken", "schlafen", "spielen"] },
      { text: "Sie ___ sehr gut Englisch.", answer: "spricht", hint: "verb: to speak (sie/er)", options: ["spricht", "lernt", "geht", "schreibt"] },
      { text: "Morgen ___ wir in den Park.", answer: "gehen", hint: "verb: to go", options: ["gehen", "essen", "schlafen", "arbeiten"] },
      { text: "Das Kind ___ mit dem Ball.", answer: "spielt", hint: "verb: to play", options: ["spielt", "schläft", "isst", "trinkt"] },
      { text: "Ich wohne in ___.", answer: "Deutschland", hint: "country", options: ["Deutschland", "Frankreich", "Spanien", "Italien"] },
    ],
  },

  "hangman": {
    items: [
      { word: "Schmetterling", hint: "Ein buntes fliegendes Insekt", category: "Tiere" },
      { word: "Kindergarten", hint: "Bevor man in die Schule kommt", category: "Bildung" },
      { word: "Sonnenblume", hint: "Eine gelbe Blume", category: "Pflanzen" },
      { word: "Kühlschrank", hint: "Für kalte Lebensmittel", category: "Haushalt" },
      { word: "Telefon", hint: "Zum Telefonieren", category: "Technik" },
      { word: "Geburtstag", hint: "Den feiert man einmal im Jahr", category: "Feste" },
      { word: "Freundschaft", hint: "Zwischen guten Freunden", category: "Gefühle" },
      { word: "Regenbogen", hint: "Nach dem Regen am Himmel", category: "Natur" },
      { word: "Zahnbürste", hint: "Für die Mundhygiene", category: "Hygiene" },
      { word: "Weihnachten", hint: "Deutsches Fest im Dezember", category: "Feste" },
      { word: "Frühstück", hint: "Die erste Mahlzeit des Tages", category: "Essen" },
      { word: "Spaziergang", hint: "Ein Spaziergang im Park", category: "Aktivitäten" },
    ],
  },

  "typing-speed-race": {
    items: [
      { phrase: "Ich lerne Deutsch.", translation: "I am learning German." },
      { phrase: "Guten Morgen!", translation: "Good morning!" },
      { phrase: "Wie geht es dir?", translation: "How are you?" },
      { phrase: "Mir geht es gut, danke.", translation: "I am fine, thank you." },
      { phrase: "Wo ist die Schule?", translation: "Where is the school?" },
      { phrase: "Das Wetter ist schön heute.", translation: "The weather is nice today." },
      { phrase: "Ich habe Hunger.", translation: "I am hungry." },
      { phrase: "Können Sie mir helfen?", translation: "Can you help me?" },
      { phrase: "Ich spreche ein bisschen Deutsch.", translation: "I speak a little German." },
      { phrase: "Auf Wiedersehen!", translation: "Goodbye!" },
    ],
  },

  "missing-vowels": {
    items: [
      { word: "Hund", hint: "dog" }, { word: "Katze", hint: "cat" },
      { word: "Apfel", hint: "apple" }, { word: "Brot", hint: "bread" },
      { word: "Milch", hint: "milk" }, { word: "Haus", hint: "house" },
      { word: "Schule", hint: "school" }, { word: "Baum", hint: "tree" },
      { word: "Blume", hint: "flower" }, { word: "Tisch", hint: "table" },
      { word: "Stuhl", hint: "chair" }, { word: "Buch", hint: "book" },
    ],
  },

  "reverse-spelling": {
    items: [
      { word: "Hund", meaning: "dog" }, { word: "Katze", meaning: "cat" },
      { word: "Haus", meaning: "house" }, { word: "Brot", meaning: "bread" },
      { word: "Milch", meaning: "milk" }, { word: "Baum", meaning: "tree" },
      { word: "Buch", meaning: "book" }, { word: "Tisch", meaning: "table" },
      { word: "Stuhl", meaning: "chair" }, { word: "Kind", meaning: "child" },
    ],
  },

  "ghost-writer": {
    items: [
      { word: "Schmetterling", revealed: 3, hint: "butterfly" },
      { word: "Kindergarten", revealed: 4, hint: "kindergarten" },
      { word: "Deutschland", revealed: 4, hint: "Germany" },
      { word: "Frühstück", revealed: 3, hint: "breakfast" },
      { word: "Weihnachten", revealed: 4, hint: "Christmas" },
      { word: "Geburtstag", revealed: 3, hint: "birthday" },
      { word: "Freundschaft", revealed: 4, hint: "friendship" },
      { word: "Kühlschrank", revealed: 3, hint: "refrigerator" },
      { word: "Sonnenblume", revealed: 4, hint: "sunflower" },
      { word: "Regenbogen", revealed: 3, hint: "rainbow" },
    ],
  },

  "letter-drop": {
    items: [
      { word: "Hund", meaning: "dog" }, { word: "Katze", meaning: "cat" },
      { word: "Haus", meaning: "house" }, { word: "Apfel", meaning: "apple" },
      { word: "Brot", meaning: "bread" }, { word: "Milch", meaning: "milk" },
      { word: "Baum", meaning: "tree" }, { word: "Tisch", meaning: "table" },
      { word: "Blume", meaning: "flower" }, { word: "Buch", meaning: "book" },
    ],
  },

  "crossword-puzzle": {
    clues: [
      { answer: "HUND", clue: "Dog in German", direction: "across", row: 0, col: 0 },
      { answer: "HAUS", clue: "House in German", direction: "down", row: 0, col: 0 },
      { answer: "APFEL", clue: "Apple in German", direction: "across", row: 2, col: 1 },
      { answer: "BROT", clue: "Bread in German", direction: "down", row: 2, col: 4 },
      { answer: "MILCH", clue: "Milk in German", direction: "across", row: 5, col: 0 },
      { answer: "SCHULE", clue: "School in German", direction: "across", row: 7, col: 0 },
      { answer: "WASSER", clue: "Water in German", direction: "down", row: 4, col: 6 },
      { answer: "BAUM", clue: "Tree in German", direction: "across", row: 9, col: 2 },
    ],
  },

  "word-jumble-sentence": {
    sentences: [
      { sentence: "Ich lerne Deutsch.", translation: "I am learning German." },
      { sentence: "Das Haus ist groß.", translation: "The house is big." },
      { sentence: "Wir gehen in die Schule.", translation: "We go to school." },
      { sentence: "Er hat einen Hund.", translation: "He has a dog." },
      { sentence: "Die Blume ist schön.", translation: "The flower is beautiful." },
      { sentence: "Ich esse einen Apfel.", translation: "I eat an apple." },
      { sentence: "Sie trinkt Milch.", translation: "She drinks milk." },
      { sentence: "Das Wetter ist heute gut.", translation: "The weather is good today." },
      { sentence: "Meine Mutter kocht das Mittagessen.", translation: "My mother cooks lunch." },
      { sentence: "Der Hund spielt im Garten.", translation: "The dog plays in the garden." },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  GRAMMAR & STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════

  "gender-guesser": {
    nouns: [
      { noun: "Hund", article: "der", meaning: "dog" }, { noun: "Katze", article: "die", meaning: "cat" },
      { noun: "Haus", article: "das", meaning: "house" }, { noun: "Tisch", article: "der", meaning: "table" },
      { noun: "Blume", article: "die", meaning: "flower" }, { noun: "Buch", article: "das", meaning: "book" },
      { noun: "Stuhl", article: "der", meaning: "chair" }, { noun: "Schule", article: "die", meaning: "school" },
      { noun: "Kind", article: "das", meaning: "child" }, { noun: "Vater", article: "der", meaning: "father" },
      { noun: "Mutter", article: "die", meaning: "mother" }, { noun: "Auto", article: "das", meaning: "car" },
      { noun: "Baum", article: "der", meaning: "tree" }, { noun: "Straße", article: "die", meaning: "street" },
      { noun: "Fenster", article: "das", meaning: "window" }, { noun: "Apfel", article: "der", meaning: "apple" },
      { noun: "Tür", article: "die", meaning: "door" }, { noun: "Bett", article: "das", meaning: "bed" },
      { noun: "Garten", article: "der", meaning: "garden" }, { noun: "Küche", article: "die", meaning: "kitchen" },
    ],
  },

  "sentence-builder": {
    sentences: [
      { sentence: "Ich gehe in die Schule.", translation: "I go to school.", grammarTopic: "Akkusativ" },
      { sentence: "Er hat einen großen Hund.", translation: "He has a big dog.", grammarTopic: "Akkusativ" },
      { sentence: "Wir essen das Abendessen zusammen.", translation: "We eat dinner together.", grammarTopic: "Akkusativ" },
      { sentence: "Sie lernt jeden Tag Deutsch.", translation: "She learns German every day.", grammarTopic: "Akkusativ" },
      { sentence: "Das Kind spielt im Garten.", translation: "The child plays in the garden.", grammarTopic: "Dativ" },
      { sentence: "Meine Familie wohnt in Berlin.", translation: "My family lives in Berlin.", grammarTopic: "Dativ" },
      { sentence: "Der Lehrer erklärt die Aufgabe.", translation: "The teacher explains the task.", grammarTopic: "Akkusativ" },
      { sentence: "Ich trinke jeden Morgen Kaffee.", translation: "I drink coffee every morning.", grammarTopic: "Akkusativ" },
      { sentence: "Sie fährt mit dem Zug zur Arbeit.", translation: "She travels to work by train.", grammarTopic: "Dativ" },
      { sentence: "Wir besuchen unsere Großeltern am Sonntag.", translation: "We visit our grandparents on Sunday.", grammarTopic: "Akkusativ" },
    ],
  },

  "conjugation-quiz": {
    items: [
      { prompt: "ich ___ [sein]", answer: "bin" }, { prompt: "du ___ [sein]", answer: "bist" },
      { prompt: "er/sie ___ [sein]", answer: "ist" }, { prompt: "wir ___ [sein]", answer: "sind" },
      { prompt: "ich ___ [haben]", answer: "habe" }, { prompt: "du ___ [haben]", answer: "hast" },
      { prompt: "er/sie ___ [haben]", answer: "hat" }, { prompt: "ich ___ [gehen]", answer: "gehe" },
      { prompt: "du ___ [gehen]", answer: "gehst" }, { prompt: "er ___ [gehen]", answer: "geht" },
      { prompt: "ich ___ [kommen]", answer: "komme" }, { prompt: "du ___ [kommen]", answer: "kommst" },
      { prompt: "ich ___ [machen]", answer: "mache" }, { prompt: "ich ___ [spielen]", answer: "spiele" },
      { prompt: "ich ___ [lernen]", answer: "lerne" },
    ],
  },

  "plural-panic": {
    items: [
      { singular: "der Hund", plural: "die Hunde" }, { singular: "die Katze", plural: "die Katzen" },
      { singular: "das Haus", plural: "die Häuser" }, { singular: "das Buch", plural: "die Bücher" },
      { singular: "der Tisch", plural: "die Tische" }, { singular: "der Stuhl", plural: "die Stühle" },
      { singular: "die Blume", plural: "die Blumen" }, { singular: "das Kind", plural: "die Kinder" },
      { singular: "der Vater", plural: "die Väter" }, { singular: "die Mutter", plural: "die Mütter" },
      { singular: "der Apfel", plural: "die Äpfel" }, { singular: "das Ei", plural: "die Eier" },
      { singular: "das Auto", plural: "die Autos" }, { singular: "der Baum", plural: "die Bäume" },
      { singular: "die Tür", plural: "die Türen" },
    ],
  },

  "case-challenge": {
    items: [
      { sentence: "Der Hund bellt laut.", word: "Der Hund", case: "Nominativ", options: ["Akkusativ", "Dativ", "Genitiv"] },
      { sentence: "Ich sehe den Mann.", word: "den Mann", case: "Akkusativ", options: ["Nominativ", "Dativ", "Genitiv"] },
      { sentence: "Ich gebe dem Kind einen Ball.", word: "dem Kind", case: "Dativ", options: ["Nominativ", "Akkusativ", "Genitiv"] },
      { sentence: "Das ist das Buch des Lehrers.", word: "des Lehrers", case: "Genitiv", options: ["Nominativ", "Akkusativ", "Dativ"] },
      { sentence: "Die Frau kauft einen Apfel.", word: "Die Frau", case: "Nominativ", options: ["Akkusativ", "Dativ", "Genitiv"] },
      { sentence: "Er hilft dem alten Mann.", word: "dem alten Mann", case: "Dativ", options: ["Nominativ", "Akkusativ", "Genitiv"] },
      { sentence: "Wir sehen die Schule.", word: "die Schule", case: "Akkusativ", options: ["Nominativ", "Dativ", "Genitiv"] },
      { sentence: "Das Auto der Mutter ist rot.", word: "der Mutter", case: "Genitiv", options: ["Nominativ", "Akkusativ", "Dativ"] },
      { sentence: "Sie schreibt einen Brief.", word: "einen Brief", case: "Akkusativ", options: ["Nominativ", "Dativ", "Genitiv"] },
      { sentence: "Der Lehrer erklärt den Schülern.", word: "den Schülern", case: "Dativ", options: ["Nominativ", "Akkusativ", "Genitiv"] },
    ],
  },

  "adjective-endings": {
    sentences: [
      { text: "Das ist ein ___ Hund. (groß)", answer: "großer", options: ["große", "großem", "großen"] },
      { text: "Ich sehe den ___ Baum. (alt)", answer: "alten", options: ["alter", "alte", "altem"] },
      { text: "Sie hat eine ___ Katze. (schwarz)", answer: "schwarze", options: ["schwarzer", "schwarzen", "schwarzem"] },
      { text: "Das ___ Kind spielt. (klein)", answer: "kleine", options: ["kleiner", "kleinen", "kleinem"] },
      { text: "Er trinkt ___ Kaffee. (heiß)", answer: "heißen", options: ["heiß", "heißer", "heißem"] },
      { text: "Wir haben ein ___ Haus. (schön)", answer: "schönes", options: ["schöne", "schöner", "schönem"] },
      { text: "Mit dem ___ Zug fahren. (schnell)", answer: "schnellen", options: ["schnell", "schnelle", "schnellem"] },
      { text: "Die ___ Lehrerin erklärt. (jung)", answer: "junge", options: ["junger", "jungen", "jungem"] },
    ],
  },

  "preposition-picker": {
    sentences: [
      { text: "Ich gehe ___ die Schule. (into the school)", answer: "in", options: ["auf", "unter", "hinter"] },
      { text: "Das Buch liegt ___ dem Tisch. (on the table)", answer: "auf", options: ["in", "unter", "hinter"] },
      { text: "Der Hund sitzt ___ dem Stuhl. (under)", answer: "unter", options: ["auf", "in", "über"] },
      { text: "Er kommt ___ Deutschland. (from)", answer: "aus", options: ["nach", "zu", "von"] },
      { text: "Wir fahren ___ Berlin. (to a city)", answer: "nach", options: ["in", "aus", "von"] },
      { text: "Das Bild hängt ___ der Wand. (on)", answer: "an", options: ["auf", "in", "unter"] },
      { text: "Ich wohne ___ meiner Familie. (with)", answer: "bei", options: ["mit", "von", "zu"] },
      { text: "Er steht ___ der Tür. (in front of)", answer: "vor", options: ["hinter", "neben", "über"] },
      { text: "Das Haus ist ___ dem Park. (next to)", answer: "neben", options: ["über", "unter", "vor"] },
      { text: "Sie kommt ___ der Arbeit. (from)", answer: "von", options: ["nach", "zu", "aus"] },
    ],
  },

  "tense-transformer": {
    items: [
      { sentence: "Ich gehe in die Schule. → Vergangenheit (Simple Past)", answer: "Ich ging in die Schule." },
      { sentence: "Er isst einen Apfel. → Perfekt", answer: "Er hat einen Apfel gegessen." },
      { sentence: "Wir spielen im Garten. → Vergangenheit", answer: "Wir spielten im Garten." },
      { sentence: "Sie schläft früh. → Vergangenheit", answer: "Sie schlief früh." },
      { sentence: "Ich lerne Deutsch. → Zukunft (Futur I)", answer: "Ich werde Deutsch lernen." },
      { sentence: "Du kommst morgen. → Perfekt", answer: "Du bist morgen gekommen." },
      { sentence: "Das Kind spielt. → Vergangenheit", answer: "Das Kind spielte." },
      { sentence: "Wir fahren nach Berlin. → Perfekt", answer: "Wir sind nach Berlin gefahren." },
    ],
  },

  "modal-verb-mixer": {
    sentences: [
      { text: "Ich ___ Deutsch sprechen. (can)", answer: "kann", options: ["muss", "will", "darf"] },
      { text: "Du ___ jetzt schlafen. (must)", answer: "musst", options: ["kannst", "willst", "darfst"] },
      { text: "Er ___ Arzt werden. (wants to)", answer: "will", options: ["kann", "muss", "soll"] },
      { text: "Wir ___ leise sein. (should)", answer: "sollen", options: ["können", "müssen", "wollen"] },
      { text: "Sie ___ hier nicht rauchen. (may not)", answer: "darf", options: ["kann", "muss", "soll"] },
      { text: "Ich ___ morgen früh aufstehen. (have to)", answer: "muss", options: ["kann", "will", "darf"] },
      { text: "Du ___ das Fenster öffnen. (may)", answer: "darfst", options: ["musst", "kannst", "sollst"] },
      { text: "Er ___ nicht kommen. (cannot)", answer: "kann", options: ["muss", "will", "soll"] },
    ],
  },

  "negation-game": {
    sentences: [
      { text: "Ich habe ___ Hund.", answer: "keinen", options: ["nicht", "kein", "keine"] },
      { text: "Er kommt ___ heute.", answer: "nicht", options: ["keinen", "kein", "keine"] },
      { text: "Sie hat ___ Zeit.", answer: "keine", options: ["nicht", "keinen", "kein"] },
      { text: "Das ist ___ mein Buch.", answer: "nicht", options: ["kein", "keine", "keinen"] },
      { text: "Ich esse ___ Fleisch.", answer: "kein", options: ["nicht", "keine", "keinen"] },
      { text: "Wir gehen ___ ins Kino.", answer: "nicht", options: ["kein", "keine", "keinen"] },
      { text: "Er hat ___ Auto.", answer: "kein", options: ["nicht", "keine", "keinen"] },
      { text: "Das schmeckt ___ gut.", answer: "nicht", options: ["kein", "keine", "keinen"] },
    ],
  },

  "word-order-fixer": {
    sentences: [
      { sentence: "Ich gehe heute in die Schule.", translation: "I go to school today." },
      { sentence: "Er hat gestern einen Film gesehen.", translation: "He watched a film yesterday." },
      { sentence: "Wir essen immer zusammen zu Abend.", translation: "We always eat dinner together." },
      { sentence: "Sie lernt jeden Tag Deutsch.", translation: "She learns German every day." },
      { sentence: "Das Kind spielt gern im Garten.", translation: "The child likes to play in the garden." },
      { sentence: "Meine Mutter kocht sehr gut.", translation: "My mother cooks very well." },
      { sentence: "Er fährt jeden Morgen mit dem Fahrrad.", translation: "He cycles every morning." },
      { sentence: "Wir haben gestern unsere Hausaufgaben gemacht.", translation: "Yesterday we did our homework." },
    ],
  },

  "separable-verb-splitter": {
    items: [
      { sentence: "Ich stehe um 7 Uhr auf.", prefix: "auf", verb: "stehen" },
      { sentence: "Er ruft seine Mutter an.", prefix: "an", verb: "rufen" },
      { sentence: "Wir machen das Licht aus.", prefix: "aus", verb: "machen" },
      { sentence: "Sie kommt um 8 Uhr zurück.", prefix: "zurück", verb: "kommen" },
      { sentence: "Er kauft im Supermarkt ein.", prefix: "ein", verb: "kaufen" },
      { sentence: "Ich ziehe meine Jacke an.", prefix: "an", verb: "ziehen" },
      { sentence: "Wir gehen um 10 Uhr ab.", prefix: "ab", verb: "gehen" },
      { sentence: "Sie räumt ihr Zimmer auf.", prefix: "auf", verb: "räumen" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  LISTENING & AUDIO (transcripts instead of audio files)
  // ══════════════════════════════════════════════════════════════════════════

  "listen-and-choose": {
    audioItems: [
      { audioUrl: "", transcript: "Guten Morgen!", correctAnswer: "Good morning!", options: ["Good evening!", "Good night!", "Hello!"] },
      { audioUrl: "", transcript: "Wie heißt du?", correctAnswer: "What is your name?", options: ["How are you?", "Where do you live?", "How old are you?"] },
      { audioUrl: "", transcript: "Ich heiße Maria.", correctAnswer: "My name is Maria.", options: ["I am Maria's friend.", "Maria is here.", "This is Maria."] },
      { audioUrl: "", transcript: "Wie alt bist du?", correctAnswer: "How old are you?", options: ["Where are you from?", "What is your name?", "How are you?"] },
      { audioUrl: "", transcript: "Ich bin zwanzig Jahre alt.", correctAnswer: "I am twenty years old.", options: ["I am twelve years old.", "I am twenty-two years old.", "I am thirty years old."] },
      { audioUrl: "", transcript: "Wo wohnst du?", correctAnswer: "Where do you live?", options: ["How do you live?", "When do you live here?", "Who lives here?"] },
      { audioUrl: "", transcript: "Ich komme aus Deutschland.", correctAnswer: "I come from Germany.", options: ["I go to Germany.", "I live in Germany.", "I like Germany."] },
      { audioUrl: "", transcript: "Was machst du?", correctAnswer: "What do you do?", options: ["Who are you?", "Where do you go?", "When do you come?"] },
      { audioUrl: "", transcript: "Ich bin Schüler.", correctAnswer: "I am a student.", options: ["I am a teacher.", "I am a doctor.", "I am a friend."] },
      { audioUrl: "", transcript: "Auf Wiedersehen!", correctAnswer: "Goodbye!", options: ["Good morning!", "Thank you!", "Please!"] },
    ],
  },

  "dictation-drop": {
    audioItems: [
      { audioUrl: "", transcript: "Guten Morgen" }, { audioUrl: "", transcript: "Wie geht es dir" },
      { audioUrl: "", transcript: "Ich lerne Deutsch" }, { audioUrl: "", transcript: "Das ist ein Hund" },
      { audioUrl: "", transcript: "Wo ist die Schule" }, { audioUrl: "", transcript: "Ich habe Hunger" },
      { audioUrl: "", transcript: "Es ist schön heute" }, { audioUrl: "", transcript: "Ich bin müde" },
      { audioUrl: "", transcript: "Auf Wiedersehen" }, { audioUrl: "", transcript: "Danke schön" },
    ],
  },

  "odd-one-out-audio": {
    items: [
      { words: ["Hund", "Katze", "Vogel", "Tisch"], oddOne: "Tisch" },
      { words: ["rot", "blau", "grün", "Apfel"], oddOne: "Apfel" },
      { words: ["essen", "trinken", "schlafen", "Hund"], oddOne: "Hund" },
      { words: ["Mutter", "Vater", "Bruder", "Tisch"], oddOne: "Tisch" },
      { words: ["Montag", "Dienstag", "Mittwoch", "Apfel"], oddOne: "Apfel" },
      { words: ["groß", "klein", "schön", "gehen"], oddOne: "gehen" },
      { words: ["Januar", "Februar", "März", "Hund"], oddOne: "Hund" },
      { words: ["Brot", "Milch", "Käse", "Stuhl"], oddOne: "Stuhl" },
    ],
  },

  "rhyme-finder": {
    pairs: [
      { word: "Haus", rhyme: "Maus" }, { word: "Hund", rhyme: "bunt" },
      { word: "Brot", rhyme: "rot" }, { word: "Tag", rhyme: "lag" },
      { word: "Schule", rhyme: "kühle" }, { word: "Wind", rhyme: "Kind" },
      { word: "Buch", rhyme: "Tuch" }, { word: "Nacht", rhyme: "acht" },
      { word: "Zug", rhyme: "Flug" }, { word: "Zeit", rhyme: "weit" },
    ],
  },

  "slow-to-fast-listening": {
    audioItems: [
      { audioUrl: "", answer: "Guten Morgen" }, { audioUrl: "", answer: "Auf Wiedersehen" },
      { audioUrl: "", answer: "Wie geht es dir" }, { audioUrl: "", answer: "Ich lerne Deutsch" },
      { audioUrl: "", answer: "Das Wetter ist schön" }, { audioUrl: "", answer: "Wo ist der Bahnhof" },
      { audioUrl: "", answer: "Können Sie mir helfen" }, { audioUrl: "", answer: "Ich verstehe nicht" },
    ],
  },

  "minimal-pairs": {
    items: [
      { audioUrl: "", wordA: "Miete", wordB: "Mitte", correct: "Miete" },
      { audioUrl: "", wordA: "Bett", wordB: "Bitte", correct: "Bett" },
      { audioUrl: "", wordA: "Hund", wordB: "Wund", correct: "Hund" },
      { audioUrl: "", wordA: "See", wordB: "Zeh", correct: "See" },
      { audioUrl: "", wordA: "Bahn", wordB: "Wahn", correct: "Bahn" },
      { audioUrl: "", wordA: "vier", wordB: "wir", correct: "vier" },
      { audioUrl: "", wordA: "Eis", wordB: "aus", correct: "Eis" },
      { audioUrl: "", wordA: "Stadt", wordB: "statt", correct: "Stadt" },
    ],
  },

  "tone-and-stress-quiz": {
    items: [
      { word: "Hallo", syllables: ["Hal", "lo"], stressedIndex: 0 },
      { word: "Deutsch", syllables: ["Deutsch"], stressedIndex: 0 },
      { word: "Schule", syllables: ["Schu", "le"], stressedIndex: 0 },
      { word: "Guten Morgen", syllables: ["Gu", "ten", "Mor", "gen"], stressedIndex: 2 },
      { word: "Entschuldigung", syllables: ["Ent", "schul", "di", "gung"], stressedIndex: 1 },
      { word: "Danke", syllables: ["Dan", "ke"], stressedIndex: 0 },
      { word: "Aufmerksamkeit", syllables: ["Auf", "merk", "sam", "keit"], stressedIndex: 0 },
      { word: "Kindergarten", syllables: ["Kin", "der", "gar", "ten"], stressedIndex: 0 },
    ],
  },

  "song-lyrics-fill-in": {
    items: [
      { line: "Alle meine ___ stehen noch.", answer: "Entchen", options: ["Freunde", "Kinder", "Häuser"] },
      { line: "Hänschen ___, geh nach Haus.", answer: "klein", options: ["groß", "schnell", "alt"] },
      { line: "Kuckuck, ___, aus dem Wald.", answer: "Kuckuck", options: ["Vogel", "Tier", "Ruf"] },
      { line: "Bruder Jakob, ___ du noch?", answer: "schläfst", options: ["schläft", "schlafen", "schlaft"] },
      { line: "Oh Tannenbaum, oh Tannenbaum, wie ___ sind deine Blätter!", answer: "grün", options: ["schön", "groß", "alt"] },
    ],
  },

  "dialogue-listen": {
    items: [
      { audioUrl: "", question: "Was fragt der Verkäufer?", answer: "Kann ich Ihnen helfen?", options: ["Wie viel kostet das?", "Wo ist die Kasse?", "Was möchten Sie?"] },
      { audioUrl: "", question: "Wie antwortet der Kunde?", answer: "Ich suche ein Hemd.", options: ["Ich kaufe nichts.", "Ich bin fertig.", "Guten Tag."] },
      { audioUrl: "", question: "Was kostet der Apfelsaft?", answer: "Zwei Euro fünfzig", options: ["Drei Euro", "Ein Euro", "Fünf Euro"] },
      { audioUrl: "", question: "Wann fährt der nächste Zug?", answer: "Um 14:30 Uhr", options: ["Um 13:00 Uhr", "Um 15:00 Uhr", "Um 16:30 Uhr"] },
      { audioUrl: "", question: "Wo liegt das Hotel?", answer: "In der Hauptstraße", options: ["Am Bahnhof", "Im Park", "Neben dem Supermarkt"] },
    ],
  },

  "accent-detective": {
    items: [
      { audioUrl: "", region: "Bayerisch", options: ["Berlinerisch", "Sächsisch", "Hamburgisch"] },
      { audioUrl: "", region: "Berlinerisch", options: ["Bayerisch", "Wienerisch", "Kölnisch"] },
      { audioUrl: "", region: "Hamburgisch", options: ["Bayerisch", "Sächsisch", "Schwäbisch"] },
      { audioUrl: "", region: "Sächsisch", options: ["Bayerisch", "Hamburgisch", "Berlinerisch"] },
      { audioUrl: "", region: "Kölnisch", options: ["Hamburgisch", "Bayerisch", "Sächsisch"] },
      { audioUrl: "", region: "Wienerisch", options: ["Berlinerisch", "Sächsisch", "Hamburgisch"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SPEED & CHALLENGE
  // ══════════════════════════════════════════════════════════════════════════

  "speed-translation": { items: BASIC_VOCAB_MC },
  "true-or-false": {
    items: [
      { statement: "'Hund' means 'dog' in German.", isTrue: true },
      { statement: "'Katze' means 'cat' in German.", isTrue: true },
      { statement: "'Haus' means 'car' in German.", isTrue: false },
      { statement: "The German word for 'school' is 'Schule'.", isTrue: true },
      { statement: "'Danke' means 'please' in German.", isTrue: false },
      { statement: "'Bitte' means 'please' in German.", isTrue: true },
      { statement: "The German word for 'book' is 'Buch'.", isTrue: true },
      { statement: "In German, nouns are always capitalized.", isTrue: true },
      { statement: "The article for 'Hund' (dog) is 'die'.", isTrue: false },
      { statement: "The article for 'Schule' (school) is 'die'.", isTrue: true },
      { statement: "'Guten Morgen' means 'Good evening'.", isTrue: false },
      { statement: "'Auf Wiedersehen' means 'Goodbye'.", isTrue: true },
      { statement: "Germany is called 'Deutschland' in German.", isTrue: true },
      { statement: "The plural of 'Haus' is 'Häuser'.", isTrue: true },
      { statement: "'Wasser' means 'fire' in German.", isTrue: false },
    ],
  },
  "beat-the-clock-vocab": { items: BASIC_VOCAB_MC },
  "streak-challenge": { items: BASIC_VOCAB_MC },
  "lightning-round": { items: BASIC_VOCAB_MC },
  "sudden-death": { items: BASIC_VOCAB_MC },
  "multiplier-madness": { items: BASIC_VOCAB_MC },
  "daily-duel": { items: BASIC_VOCAB_MC },

  "word-ladder": {
    puzzles: [
      { start: "Hand", end: "Band", steps: ["Wand"] },
      { start: "Haus", end: "Maus", steps: [] },
      { start: "Zeit", end: "Weit", steps: [] },
      { start: "Brot", end: "Grot", steps: [] },
      { start: "Tag", end: "Weg", steps: ["Teg"] },
    ],
  },

  "boss-battle": { items: BASIC_VOCAB_MC },

  // ══════════════════════════════════════════════════════════════════════════
  //  CONTEXT & CULTURE
  // ══════════════════════════════════════════════════════════════════════════

  "sentence-translator": {
    sentences: [
      pair("Ich spreche ein bisschen Deutsch.", "I speak a little German."),
      pair("Wie viel kostet das?", "How much does that cost?"),
      pair("Können Sie mir helfen?", "Can you help me?"),
      pair("Wo ist der Bahnhof?", "Where is the train station?"),
      pair("Ich verstehe das nicht.", "I don't understand that."),
      pair("Sprechen Sie Englisch?", "Do you speak English?"),
      pair("Ich hätte gerne ein Zimmer.", "I would like a room."),
      pair("Wann fährt der nächste Zug?", "When does the next train leave?"),
      pair("Die Rechnung bitte.", "The bill, please."),
      pair("Guten Appetit!", "Enjoy your meal!"),
    ],
  },

  "idiom-guesser": {
    items: [
      { idiom: "Das ist nicht mein Bier.", answer: "That's not my problem / business.", options: ["I don't drink beer.", "That's very tasty.", "I want more beer."] },
      { idiom: "Ich verstehe nur Bahnhof.", answer: "I don't understand a word (lit. I only understand 'train station').", options: ["I love train stations.", "I want to go to the station.", "The station is far away."] },
      { idiom: "Du hast einen Vogel.", answer: "You're crazy! (lit. You have a bird).", options: ["You have a pet bird.", "You can fly.", "You're very lucky."] },
      { idiom: "Alles hat ein Ende, nur die Wurst hat zwei.", answer: "Everything comes to an end (lit. Everything has an end, only sausage has two).", options: ["Sausages are delicious.", "Eat your sausage.", "I love German food."] },
      { idiom: "Das ist mir Wurst.", answer: "That's all the same to me / I don't care (lit. That is sausage to me).", options: ["I love sausages.", "Please give me sausage.", "Sausage is delicious."] },
      { idiom: "Jetzt geht's um die Wurst.", answer: "Now it's crunch time / now it's all or nothing (lit. Now it's about the sausage).", options: ["Time to eat sausage.", "The sausage is ready.", "Let's go to the butcher."] },
      { idiom: "Auf dem Holzweg sein", answer: "To be on the wrong track (lit. to be on the wood path).", options: ["To walk in the forest.", "To collect firewood.", "To be in nature."] },
      { idiom: "Die Daumen drücken", answer: "To keep one's fingers crossed (lit. to press the thumbs).", options: ["To give a thumbs up.", "To hurt your thumb.", "To count on fingers."] },
    ],
  },

  "number-date-quiz": {
    items: [
      mc("Wie sagt man '1' auf Deutsch?", "eins", ["zwei", "drei", "vier"]),
      mc("Wie sagt man '5' auf Deutsch?", "fünf", ["vier", "sechs", "sieben"]),
      mc("Wie sagt man '10' auf Deutsch?", "zehn", ["elf", "neun", "zwölf"]),
      mc("Wie sagt man '20' auf Deutsch?", "zwanzig", ["dreißig", "zwölf", "vierzig"]),
      mc("Wie sagt man '100' auf Deutsch?", "hundert", ["tausend", "zehn", "zwanzig"]),
      mc("Was bedeutet 'Montag'?", "Monday", ["Tuesday", "Wednesday", "Sunday"]),
      mc("Was bedeutet 'Samstag'?", "Saturday", ["Sunday", "Friday", "Monday"]),
      mc("Was bedeutet 'Januar'?", "January", ["June", "July", "March"]),
      mc("Was bedeutet 'Dezember'?", "December", ["November", "October", "September"]),
      mc("Wie sagt man '15' auf Deutsch?", "fünfzehn", ["fünfzig", "vierzehn", "sechzehn"]),
      mc("Was ist 'Mitternacht'?", "midnight", ["midday", "morning", "evening"]),
      mc("Was bedeutet 'gestern'?", "yesterday", ["today", "tomorrow", "now"]),
      mc("Was bedeutet 'morgen'?", "tomorrow", ["yesterday", "today", "soon"]),
      mc("Wie viele Tage hat eine Woche?", "sieben", ["fünf", "sechs", "acht"]),
      mc("Wie viele Monate hat ein Jahr?", "zwölf", ["zehn", "elf", "dreizehn"]),
    ],
  },

  "category-sort": {
    items: [
      { word: "Hund", bucket: "Tiere" }, { word: "Katze", bucket: "Tiere" },
      { word: "Vogel", bucket: "Tiere" }, { word: "Pferd", bucket: "Tiere" },
      { word: "Apfel", bucket: "Essen" }, { word: "Brot", bucket: "Essen" },
      { word: "Milch", bucket: "Essen" }, { word: "Käse", bucket: "Essen" },
      { word: "rot", bucket: "Farben" }, { word: "blau", bucket: "Farben" },
      { word: "grün", bucket: "Farben" }, { word: "gelb", bucket: "Farben" },
      { word: "Mutter", bucket: "Familie" }, { word: "Vater", bucket: "Familie" },
      { word: "Bruder", bucket: "Familie" }, { word: "Schwester", bucket: "Familie" },
      { word: "Tisch", bucket: "Möbel" }, { word: "Stuhl", bucket: "Möbel" },
      { word: "Bett", bucket: "Möbel" }, { word: "Sofa", bucket: "Möbel" },
    ],
  },

  "story-builder": {
    items: [
      { text: "Jeden Morgen ___ ich um sieben Uhr auf.", answer: "stehe", options: ["stehe", "schlafe", "esse", "trinke"] },
      { text: "Dann ___ ich Frühstück.", answer: "esse", options: ["esse", "trinke", "lerne", "gehe"] },
      { text: "Um acht Uhr ___ ich zur Schule.", answer: "gehe", options: ["gehe", "fahre", "schlafe", "esse"] },
      { text: "In der Schule ___ ich viel.", answer: "lerne", options: ["lerne", "schlafe", "esse", "spiele"] },
      { text: "Mittags ___ ich mit meinen Freunden.", answer: "esse", options: ["esse", "schlafe", "lerne", "gehe"] },
      { text: "Nachmittags ___ ich Hausaufgaben.", answer: "mache", options: ["mache", "esse", "schlafe", "lerne"] },
      { text: "Abends ___ meine Familie zusammen.", answer: "isst", options: ["isst", "schläft", "lernt", "geht"] },
      { text: "Um zehn Uhr ___ ich ins Bett.", answer: "gehe", options: ["gehe", "esse", "lerne", "spiele"] },
    ],
  },

  "proverb-match": {
    pairs: [
      { german: "Ohne Fleiß kein Preis.", equivalent: "No pain, no gain." },
      { german: "Morgenstund hat Gold im Mund.", equivalent: "The early bird catches the worm." },
      { german: "Übung macht den Meister.", equivalent: "Practice makes perfect." },
      { german: "Viele Köche verderben den Brei.", equivalent: "Too many cooks spoil the broth." },
      { german: "Der Apfel fällt nicht weit vom Stamm.", equivalent: "The apple doesn't fall far from the tree." },
      { german: "Reden ist Silber, Schweigen ist Gold.", equivalent: "Speech is silver, silence is golden." },
      { german: "Ende gut, alles gut.", equivalent: "All's well that ends well." },
      { german: "Eine Schwalbe macht noch keinen Sommer.", equivalent: "One swallow doesn't make a summer." },
    ],
  },

  "false-friends": {
    items: [
      { german: "das Gift", looksLike: "gift", actualMeaning: "poison (not a present!)" },
      { german: "der Chef", looksLike: "chef", actualMeaning: "boss (not necessarily a cook)" },
      { german: "das Gymnasium", looksLike: "gymnasium", actualMeaning: "academic high school (not a gym)" },
      { german: "sensibel", looksLike: "sensible", actualMeaning: "sensitive (not sensible/reasonable)" },
      { german: "die Fabrik", looksLike: "fabric", actualMeaning: "factory (not cloth)" },
      { german: "der Slip", looksLike: "slip", actualMeaning: "underpants (not a slip of paper)" },
      { german: "der Smoking", looksLike: "smoking", actualMeaning: "tuxedo / dinner jacket (not the act of smoking)" },
      { german: "das Handy", looksLike: "handy", actualMeaning: "mobile phone (not the adjective handy)" },
      { german: "aktuell", looksLike: "actual", actualMeaning: "current/present (not actual/real)" },
      { german: "blamieren", looksLike: "blame", actualMeaning: "to embarrass (not to blame)" },
    ],
  },

  "cultural-trivia": {
    items: [
      mc("What is the capital of Germany?", "Berlin", ["Munich", "Hamburg", "Frankfurt"]),
      mc("What is the German national currency?", "Euro", ["Mark", "Pfennig", "Schilling"]),
      mc("Which beer festival is world-famous and held in Munich?", "Oktoberfest", ["Bierfest", "Münchenfest", "Herbstfest"]),
      mc("What is the famous German Christmas market called?", "Weihnachtsmarkt", ["Sommermarkt", "Blumenmarkt", "Nachtmarkt"]),
      mc("Who wrote Faust, one of Germany's most famous works?", "Goethe", ["Schiller", "Kafka", "Brecht"]),
      mc("What is the German word for 'German language'?", "Deutsch", ["Germanisch", "Deutsche", "Germanisch"]),
      mc("How many federal states (Bundesländer) does Germany have?", "16", ["12", "18", "20"]),
      mc("What is Germany's most popular sport?", "Fußball", ["Tennis", "Basketball", "Swimming"]),
      mc("What is the traditional German bread called?", "Schwarzbrot", ["Weißbrot", "Fladenbrot", "Baguette"]),
      mc("What country borders Germany to the north?", "Denmark", ["Poland", "France", "Austria"]),
    ],
  },

  "regional-dialect-quiz": {
    items: [
      { phrase: "'Grüß Gott!' statt 'Hallo'", answer: "Bayern/Österreich", options: ["Berlin", "Hamburg", "Sachsen"] },
      { phrase: "'Servus!' als Begrüßung", answer: "Bayern/Österreich", options: ["Hamburg", "Köln", "Berlin"] },
      { phrase: "'Moin!' als Begrüßung", answer: "Norddeutschland/Hamburg", options: ["Bayern", "Sachsen", "Thüringen"] },
      { phrase: "'Tschüss' sehr häufig benutzt", answer: "Norddeutschland", options: ["Bayern", "Österreich", "Sachsen"] },
      { phrase: "'Alaaf!' als Ausruf beim Karneval", answer: "Köln", options: ["Berlin", "Hamburg", "München"] },
      { phrase: "G wird wie K ausgesprochen", answer: "Berlinerisch", options: ["Bayerisch", "Sächsisch", "Hamburgerisch"] },
      { phrase: "'Bitte sehr' häufig im Service", answer: "Österreich", options: ["Hamburg", "Berlin", "Köln"] },
      { phrase: "Sehr schnelles Sprechtempo, verschluckte Endungen", answer: "Sächsisch", options: ["Hamburgisch", "Bayerisch", "Berlinisch"] },
    ],
  },

  "formal-vs-informal": {
    items: [
      { situation: "Talking to your best friend", answer: "du", options: ["Sie"] },
      { situation: "Meeting your boss for the first time", answer: "Sie", options: ["du"] },
      { situation: "Speaking with a shop assistant", answer: "Sie", options: ["du"] },
      { situation: "Talking to your younger brother", answer: "du", options: ["Sie"] },
      { situation: "Email to a professor at university", answer: "Sie", options: ["du"] },
      { situation: "Chatting with classmates", answer: "du", options: ["Sie"] },
      { situation: "Asking a police officer for directions", answer: "Sie", options: ["du"] },
      { situation: "Playing with children at a birthday party", answer: "du", options: ["Sie"] },
      { situation: "Calling customer service", answer: "Sie", options: ["du"] },
      { situation: "Texting a close colleague you've known for years", answer: "du", options: ["Sie"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  MINI ADVENTURE & ROLEPLAY
  // ══════════════════════════════════════════════════════════════════════════

  "cafe-roleplay": {
    steps: [
      mc("Der Kellner fragt: 'Was möchten Sie trinken?'", "Ich hätte gerne einen Kaffee, bitte.", ["Ich bin müde.", "Wo ist die Toilette?", "Das Wetter ist schön."]),
      mc("Der Kellner fragt: 'Mit Milch und Zucker?'", "Mit Milch, ohne Zucker, bitte.", ["Ja, ich trinke Wasser.", "Nein, kein Kaffee.", "Danke, auf Wiedersehen."]),
      mc("Der Kellner fragt: 'Möchten Sie auch etwas essen?'", "Ja, ich nehme den Kuchen.", ["Nein, ich bin kein Koch.", "Ich habe einen Hund.", "Wo ist das Kino?"]),
      mc("Die Rechnung kommt. Was sagen Sie?", "Die Rechnung, bitte.", ["Guten Morgen!", "Wo ist der Bahnhof?", "Ich spreche kein Deutsch."]),
      mc("Der Kellner sagt: 'Das macht 4 Euro 50.'", "Hier sind fünf Euro. Stimmt so.", ["Ich habe kein Geld.", "Das ist sehr teuer.", "Wo ist der Ausgang?"]),
      mc("Beim Verlassen des Cafés sagen Sie:", "Auf Wiedersehen! Danke schön!", ["Guten Morgen!", "Ich bin hungrig.", "Was kostet das?"]),
    ],
  },

  "train-station-quest": {
    steps: [
      mc("Sie suchen den Bahnhof. Was fragen Sie?", "Entschuldigung, wo ist der Bahnhof?", ["Haben Sie einen Hund?", "Wie ist das Wetter?", "Ich bin müde."]),
      mc("Am Schalter: 'Wohin möchten Sie?'", "Eine Fahrkarte nach Berlin, bitte.", ["Ich wohne in Berlin.", "Guten Morgen!", "Ich verstehe nicht."]),
      mc("'Einfach oder hin und zurück?'", "Hin und zurück, bitte.", ["Einmal täglich.", "Ich fahre gern.", "Mit dem Auto."]),
      mc("'Der Zug fährt auf Gleis 7.' Sie fragen:", "Entschuldigung, wo ist Gleis 7?", ["Wann kommt der Zug an?", "Ist der Zug schnell?", "Ich habe keine Fahrkarte."]),
      mc("Im Zug fragt der Schaffner: 'Ihre Fahrkarte bitte!'", "Hier ist meine Fahrkarte.", ["Ich habe keine.", "Wo ist die Toilette?", "Ich fahre nach Hause."]),
      mc("Sie kommen in Berlin an. Was sagen Sie?", "Entschuldigung, wo ist die U-Bahn?", ["Guten Morgen!", "Ich bin hungrig.", "Das Wetter ist schön."]),
    ],
  },

  "job-interview-simulator": {
    steps: [
      mc("Interviewer: 'Erzählen Sie etwas über sich.'", "Ich heiße Max und ich bin 25 Jahre alt.", ["Ich habe Hunger.", "Das Wetter ist schön.", "Wo ist die Toilette?"]),
      mc("Interviewer: 'Warum bewerben Sie sich hier?'", "Ich interessiere mich sehr für diese Stelle.", ["Ich brauche Geld.", "Mein Freund hat mir gesagt.", "Ich weiß es nicht."]),
      mc("Interviewer: 'Was sind Ihre Stärken?'", "Ich bin fleißig, teamfähig und lernbereit.", ["Ich esse gern Pizza.", "Ich schlafe gern aus.", "Ich spiele gern Computer."]),
      mc("Interviewer: 'Welche Sprachen sprechen Sie?'", "Ich spreche Deutsch und Englisch fließend.", ["Ich spreche laut.", "Ich spreche mit meiner Mutter.", "Ich mag Sprachen."]),
      mc("Interviewer: 'Haben Sie Fragen an uns?'", "Wie sieht ein typischer Arbeitstag aus?", ["Wann kann ich Urlaub nehmen?", "Wie viel verdiene ich?", "Gibt es Kaffee?"]),
      mc("Interviewer: 'Wann können Sie anfangen?'", "Ich könnte ab dem ersten nächsten Monats anfangen.", ["Sofort, ich habe nichts zu tun.", "Ich weiß nicht.", "Montag?"]),
    ],
  },

  "market-haggler": {
    steps: [
      mc("Der Verkäufer sagt: 'Die Äpfel kosten 3 Euro.'", "Könnten Sie einen kleinen Rabatt geben?", ["Ich mag keine Äpfel.", "Guten Morgen!", "Wie heißen Sie?"]),
      mc("Verkäufer: 'Ich kann 2,50 Euro machen.'", "Gut, dann nehme ich ein Kilo.", ["Nein, das ist zu teuer.", "Ich habe kein Geld.", "Was sind Äpfel?"]),
      mc("Verkäufer: 'Noch etwas?'", "Haben Sie auch frische Tomaten?", ["Nein danke.", "Ich bin satt.", "Wo ist der Ausgang?"]),
      mc("Verkäufer: 'Die Tomaten kosten 2 Euro pro 500g.'", "Geben Sie mir bitte ein Kilo.", ["Zu teuer!", "Ich esse keine Tomaten.", "Haben Sie Hunde?"]),
      mc("Beim Bezahlen - Was sagen Sie?", "Was macht das zusammen, bitte?", ["Ich habe kein Geld.", "Das ist billig.", "Guten Abend!"]),
      mc("Verkäufer: 'Das macht 7 Euro.'", "Danke, auf Wiedersehen!", ["Guten Morgen!", "Ich komme wieder.", "Das ist teuer."]),
    ],
  },

  "doctors-office": {
    steps: [
      mc("Die Arzthelferin fragt: 'Was fehlt Ihnen?'", "Ich habe Kopfschmerzen und Fieber.", ["Ich habe Hunger.", "Mir geht es gut.", "Ich suche den Bahnhof."]),
      mc("Der Arzt fragt: 'Seit wann haben Sie diese Beschwerden?'", "Seit gestern Abend.", ["Ich weiß nicht.", "Immer.", "Manchmal."]),
      mc("'Haben Sie Allergien?'", "Ja, ich bin allergisch gegen Penicillin.", ["Nein, ich esse alles.", "Ich habe einen Hund.", "Das weiß ich nicht."]),
      mc("Der Arzt schreibt ein Rezept. Was fragt er?", "Haben Sie eine Krankenversicherung?", ["Wie heißen Sie?", "Woher kommen Sie?", "Was essen Sie?"]),
      mc("In der Apotheke: 'Was kann ich für Sie tun?'", "Ich habe ein Rezept.", ["Ich suche Schokolade.", "Haben Sie Hunde?", "Guten Morgen!"]),
      mc("Der Apotheker gibt Ihnen die Medikamente. Sie sagen:", "Wie oft soll ich das einnehmen?", ["Was kostet das?", "Schmeckt das gut?", "Danke, Tschüss."]),
    ],
  },

  "city-explorer": {
    items: [
      { imageUrl: "", label: "der Bahnhof", options: ["das Krankenhaus", "das Rathaus", "die Schule"] },
      { imageUrl: "", label: "die Apotheke", options: ["der Supermarkt", "die Bäckerei", "der Bahnhof"] },
      { imageUrl: "", label: "die Bäckerei", options: ["die Apotheke", "der Supermarkt", "das Café"] },
      { imageUrl: "", label: "die Post", options: ["die Bank", "das Hotel", "der Marktplatz"] },
      { imageUrl: "", label: "die Kirche", options: ["das Museum", "das Theater", "das Rathaus"] },
      { imageUrl: "", label: "das Rathaus", options: ["die Schule", "das Krankenhaus", "die Kirche"] },
      { imageUrl: "", label: "der Supermarkt", options: ["die Bäckerei", "der Markt", "die Apotheke"] },
      { imageUrl: "", label: "das Krankenhaus", options: ["die Apotheke", "die Schule", "das Hotel"] },
    ],
  },

  "escape-room": {
    steps: [
      { puzzle: "Die Tür hat einen Code. Was ist 'sieben' auf Englisch?", answer: "seven", hint: "a number" },
      { puzzle: "Finde das Wort: Ich ___ Deutsch. (Verb für 'to speak')", answer: "spreche", hint: "conjugated verb" },
      { puzzle: "Was ist der Plural von 'Haus'?", answer: "Häuser", hint: "add an umlaut" },
      { puzzle: "Das Schloss öffnet mit dem richtigen Artikel. Was ist der Artikel von 'Tisch'?", answer: "der", hint: "masculine" },
      { puzzle: "Übersetze: 'I am 20 years old' auf Deutsch", answer: "Ich bin zwanzig Jahre alt", hint: "use bin" },
      { puzzle: "Was ist der Genitiv von 'der Mann'?", answer: "des Mannes", hint: "Genitiv, add -es" },
      { puzzle: "Ordne die Wörter: gehe / Schule / Ich / in / die", answer: "Ich gehe in die Schule", hint: "verb second position" },
      { puzzle: "Was bedeutet 'Auf Wiedersehen' auf Englisch?", answer: "Goodbye", hint: "farewell expression" },
    ],
  },

  "text-adventure": {
    nodes: [
      { text: "Du stehst vor einem Café in Berlin. Der Kellner lächelt. Was tust du?", choices: ["Das Café betreten", "Weitergehen", "Den Kellner ansprechen", "Eine Pause machen"], answer: "Das Café betreten" },
      { text: "Im Café fragt der Kellner: 'Was möchten Sie?' Was bestellst du?", choices: ["Einen Kaffee bitte", "Ich weiß nicht", "Sprechen Sie Englisch?", "Nichts, danke"], answer: "Einen Kaffee bitte" },
      { text: "Ein Fremder fragt auf Deutsch: 'Entschuldigung, wo ist der Bahnhof?' Antworte:", choices: ["'Es tut mir leid, ich weiß es nicht.'", "'Kein Problem!'", "'Guten Morgen!'", "'Ich bin neu hier.'"], answer: "'Es tut mir leid, ich weiß es nicht.'" },
      { text: "Du findest einen Geldbeutel auf der Straße. Was machst du?", choices: ["Zur Polizei gehen", "Ihn behalten", "Ihn ignorieren", "Öffnen"], answer: "Zur Polizei gehen" },
      { text: "Der Polizist fragt: 'Sprechen Sie Deutsch?' Antworte:", choices: ["'Ja, ein bisschen.'", "'Nein, nie!'", "'Was?'", "'Guten Appetit!'"], answer: "'Ja, ein bisschen.'" },
    ],
  },

  "time-machine": {
    items: [
      { era: "Mittelalter (Middle Ages)", prompt: "Wie begrüßte man jemanden formal?", answer: "Gott zum Gruße", options: ["Hallo!", "Servus!", "Hey!"] },
      { era: "1920er Jahre", prompt: "Wie sagte man 'super' umgangssprachlich?", answer: "dufte", options: ["toll", "super", "prima"] },
      { era: "DDR (1949-1990)", prompt: "Wie nannte man 'Supermarkt' in der DDR?", answer: "Konsum", options: ["Kaufhalle", "Laden", "Markt"] },
      { era: "Heute - Modern", prompt: "Was bedeutet 'Das ist voll krass!' im Jugendslang?", answer: "That's really intense/cool!", options: ["That's disgusting!", "I am confused.", "Please stop."] },
      { era: "Historisch", prompt: "Was bedeutete 'Herrschaft' früher?", answer: "authority / rule", options: ["servants", "horses", "servants"] },
      { era: "Gegenwart", prompt: "Was bedeutet 'Ich bin ausgebrannt'?", answer: "I am burned out.", options: ["I am on fire.", "I need food.", "I am cold."] },
      { era: "1950er Jahre", prompt: "Wie sagte man 'cool' in den 1950ern?", answer: "schick", options: ["super", "toll", "prima"] },
      { era: "Jugendsprache heute", prompt: "Was bedeutet 'Das ist Opfer!' im modernen Slang?", answer: "That's lame! / That sucks!", options: ["That's a victim.", "That's a sacrifice.", "That's a winner."] },
    ],
  },

  "pen-pal-simulator": {
    items: [
      mc("Dein Brieffreund schreibt: 'Wie ist das Wetter bei dir?'", "Bei mir scheint die Sonne und es ist warm.", ["Ich habe einen Hund.", "Guten Morgen!", "Was ist das?"]),
      mc("'Was isst du zum Frühstück?'", "Ich esse meistens Brot mit Käse und trinke Kaffee.", ["Ich schlafe gern.", "Das Wetter ist gut.", "Ich gehe zur Schule."]),
      mc("'Hast du Geschwister?'", "Ja, ich habe einen Bruder und eine Schwester.", ["Nein, ich habe einen Hund.", "Ich bin allein.", "Meine Familie ist groß."]),
      mc("'Was ist dein Lieblingsfach in der Schule?'", "Mein Lieblingsfach ist Englisch.", ["Ich mag die Schule nicht.", "Schule ist langweilig.", "Ich lerne gern."]),
      mc("'Was machst du in deiner Freizeit?'", "Ich spiele Fußball und lese gerne Bücher.", ["Ich schlafe viel.", "Ich esse Pizza.", "Ich sehe fern."]),
      mc("'Welche Musik hörst du gern?'", "Ich höre gerne Pop und manchmal Klassik.", ["Ich habe keine Ohren.", "Musik ist laut.", "Ich mag Stille."]),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  PUZZLE & LOGIC
  // ══════════════════════════════════════════════════════════════════════════

  "word-sudoku": {
    puzzles: [
      { words: ["der", "die", "das", "ein"], size: 4 },
      { words: ["rot", "blau", "grün", "gelb"], size: 4 },
      { words: ["eins", "zwei", "drei", "vier"], size: 4 },
      { words: ["Haus", "Hund", "Buch", "Tisch"], size: 4 },
      { words: ["gut", "alt", "neu", "groß"], size: 4 },
    ],
  },

  "anagram-solver": {
    items: [
      { word: "Hund", hint: "dog" }, { word: "Katze", hint: "cat" },
      { word: "Apfel", hint: "apple" }, { word: "Schule", hint: "school" },
      { word: "Brot", hint: "bread" }, { word: "Sonne", hint: "sun" },
      { word: "Baum", hint: "tree" }, { word: "Blume", hint: "flower" },
      { word: "Tisch", hint: "table" }, { word: "Haus", hint: "house" },
      { word: "Wasser", hint: "water" }, { word: "Milch", hint: "milk" },
      { word: "Kind", hint: "child" }, { word: "Vogel", hint: "bird" },
      { word: "Fisch", hint: "fish" },
    ],
  },

  "word-snake": {
    rounds: [
      { words: ["Haus", "Stuhl", "Lampe", "Elefant", "Tier", "Regen", "Name"] },
      { words: ["Hund", "Deutschland", "Tisch", "Hotel", "Licht", "Tier", "Regen"] },
      { words: ["Apfel", "Lampe", "Ende", "Esel", "Lernen", "Nacht", "Tiger"] },
      { words: ["Brot", "Tiger", "Regen", "Name", "Esel", "Lampe", "Elefant"] },
      { words: ["Katze", "Erdbeere", "Eis", "Sonne", "Ende", "Essen", "Nacht"] },
      { words: ["Schule", "Esel", "Licht", "Tiger", "Regen", "Name", "Esel"] },
    ],
  },

  "vocabulary-bingo": {
    items: [
      pair("Hund", "dog"), pair("Katze", "cat"), pair("Haus", "house"),
      pair("Apfel", "apple"), pair("Schule", "school"), pair("Buch", "book"),
      pair("Tisch", "table"), pair("Sonne", "sun"), pair("Kind", "child"),
      pair("Vater", "father"), pair("Mutter", "mother"), pair("Freund", "friend"),
      pair("Wasser", "water"), pair("Brot", "bread"), pair("Milch", "milk"),
      pair("Stuhl", "chair"), pair("Tür", "door"), pair("Fenster", "window"),
      pair("Baum", "tree"), pair("Blume", "flower"), pair("Regen", "rain"),
      pair("Schnee", "snow"), pair("Vogel", "bird"), pair("Fisch", "fish"),
      pair("Auto", "car"),
    ],
  },

  "twenty-questions-german": {
    items: [
      { answer: "Schmetterling", clues: ["Ich bin ein Tier.", "Ich kann fliegen.", "Ich habe bunte Flügel.", "Ich war mal eine Raupe.", "Man findet mich im Garten."] },
      { answer: "Kühlschrank", clues: ["Ich bin in der Küche.", "Ich bin groß und elektrisch.", "Ich halte Dinge kalt.", "Man öffnet meine Tür.", "Milch und Käse sind in mir."] },
      { answer: "Regenbogen", clues: ["Man sieht mich am Himmel.", "Ich erscheine nach dem Regen.", "Ich habe viele Farben.", "Ich bin keine Wolke.", "Kinder lieben mich."] },
      { answer: "Zahnbürste", clues: ["Ich bin im Badezimmer.", "Man benutzt mich jeden Tag.", "Ich habe Borsten.", "Man verwendet mich mit Zahnpasta.", "Ich hält die Zähne sauber."] },
      { answer: "Sonnenblume", clues: ["Ich bin eine Pflanze.", "Ich wachse sehr hoch.", "Ich habe gelbe Blütenblätter.", "Ich drehe mich zur Sonne.", "Aus mir macht man Öl."] },
    ],
  },

  "riddle-me-this": {
    items: [
      { riddle: "Ich habe viele Seiten, aber ich bin kein Haus. Man kann mich lesen. Was bin ich?", answer: "Buch", hint: "zum Lesen" },
      { riddle: "Ich habe Hände, aber ich kann nichts festhalten. Was bin ich?", answer: "Uhr", hint: "zeigt die Zeit" },
      { riddle: "Ich wachse im Garten und bin gelb oder rot. Man isst mich gern. Was bin ich?", answer: "Apfel", hint: "ein Obst" },
      { riddle: "Ich trage Wasser, aber ich bin kein Fluss. Was bin ich?", answer: "Flasche", hint: "aus Glas oder Plastik" },
      { riddle: "Am Morgen gehe ich auf vier Beinen, mittags auf zwei, abends auf drei. Was bin ich?", answer: "Mensch", hint: "Rätsel der Sphinx" },
      { riddle: "Ich bin immer vor dir, aber man kann mich nicht sehen. Was bin ich?", answer: "Zukunft", hint: "Zeit" },
      { riddle: "Je mehr man von mir wegnimmt, desto größer werde ich. Was bin ich?", answer: "Loch", hint: "eine Öffnung" },
      { riddle: "Ich habe Zähne, aber ich beiße nicht. Was bin ich?", answer: "Kamm", hint: "für die Haare" },
    ],
  },

  "connect-four-words": {
    items: BASIC_VOCAB_MC.slice(0, 15),
  },

  "german-wordle": {
    items: [
      { word: "ESSEN", meaning: "to eat / food" }, { word: "SCHÖN", meaning: "beautiful" },
      { word: "GUTEN", meaning: "good (dative)" }, { word: "HALLO", meaning: "hello" },
      { word: "DANKE", meaning: "thank you" }, { word: "BITTE", meaning: "please" },
      { word: "NACHT", meaning: "night" }, { word: "WOCHE", meaning: "week" },
      { word: "STUHL", meaning: "chair" }, { word: "TISCH", meaning: "table" },
      { word: "BLUME", meaning: "flower" }, { word: "BÄUME", meaning: "trees" },
      { word: "APFEL", meaning: "apple" }, { word: "LERNT", meaning: "learns" },
      { word: "FAHRT", meaning: "drive/trip" },
    ],
  },

  "vocabulary-tetris": {
    items: [
      pair("der Hund", "dog"), pair("die Katze", "cat"), pair("das Haus", "house"),
      pair("der Apfel", "apple"), pair("die Schule", "school"), pair("das Buch", "book"),
      pair("der Tisch", "table"), pair("die Sonne", "sun"), pair("das Kind", "child"),
      pair("der Vater", "father"), pair("die Mutter", "mother"), pair("der Baum", "tree"),
      pair("die Blume", "flower"), pair("das Wasser", "water"), pair("das Brot", "bread"),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  READING & COMPREHENSION
  // ══════════════════════════════════════════════════════════════════════════

  "short-story-quiz": {
    items: [
      { passage: "Maria wohnt in Berlin. Sie ist 25 Jahre alt und ist Lehrerin. Jeden Morgen geht sie um 8 Uhr in die Schule. Sie unterrichtet Deutsch und Englisch. Nach der Schule kauft sie im Supermarkt ein.", question: "Was ist Marias Beruf?", answer: "Lehrerin", options: ["Ärztin", "Schülerin", "Köchin"] },
      { passage: "Familie Müller macht Urlaub in München. Der Vater heißt Hans, die Mutter heißt Anna. Sie haben zwei Kinder: Lukas (10) und Lisa (8). Sie besuchen das Deutsche Museum und essen Würstchen.", question: "Wie viele Kinder hat Familie Müller?", answer: "zwei", options: ["drei", "eins", "vier"] },
      { passage: "Der kleine Max hat Geburtstag. Er ist heute 7 Jahre alt. Seine Freunde kommen zu seiner Party. Es gibt Kuchen, Limonade und Spiele. Max bekommt viele Geschenke.", question: "Wie alt ist Max heute?", answer: "7 Jahre alt", options: ["6 Jahre alt", "8 Jahre alt", "5 Jahre alt"] },
      { passage: "Im Winter in Deutschland ist es oft sehr kalt und es schneit. Die Kinder fahren Schlitten und bauen Schneemänner. In der Weihnachtszeit gibt es überall Weihnachtsmärkte mit Glühwein und Lebkuchen.", question: "Was machen die Kinder im Winter?", answer: "Sie fahren Schlitten und bauen Schneemänner.", options: ["Sie schwimmen.", "Sie spielen Tennis.", "Sie fahren Fahrrad."] },
      { passage: "Der Berliner Bär ist das Symbol der Stadt Berlin. Berlin ist die Hauptstadt von Deutschland und hat etwa 3,7 Millionen Einwohner. Die Stadt ist bekannt für ihre Geschichte, Museen und das Brandenburger Tor.", question: "Was ist das Symbol Berlins?", answer: "Der Bär", options: ["Der Adler", "Die Schlange", "Der Löwe"] },
    ],
  },

  "headline-decoder": {
    items: [
      { headline: "Deutsches Team gewinnt Fußballspiel", answer: "German team wins football match", options: ["German team loses football match", "German team plays tennis", "Football game cancelled"] },
      { headline: "Neues Gesetz für Klimaschutz verabschiedet", answer: "New law for climate protection passed", options: ["Old law for climate protection", "New law for schools", "Climate protection cancelled"] },
      { headline: "Große Schneefälle in Bayern erwartet", answer: "Heavy snowfall expected in Bavaria", options: ["Heavy rain in Berlin", "Hot summer in Bavaria", "Snowfall cancelled this year"] },
      { headline: "Berliner Mauer fiel vor 35 Jahren", answer: "Berlin Wall fell 35 years ago", options: ["Berlin Wall built 35 years ago", "New wall built in Berlin", "Berlin celebrates 100 years"] },
      { headline: "Neue U-Bahn-Linie in Hamburg eröffnet", answer: "New subway line opens in Hamburg", options: ["Hamburg subway closes", "New highway in Hamburg", "Hamburg airport opens"] },
    ],
  },

  "menu-reader": {
    items: [
      { dish: "Schnitzel mit Pommes", answer: "breaded cutlet with fries", options: ["chicken soup with bread", "grilled fish with salad", "steak with vegetables"] },
      { dish: "Bratwurst mit Sauerkraut", answer: "grilled sausage with sauerkraut", options: ["roast pork with potatoes", "grilled chicken with sauce", "fish with cabbage"] },
      { dish: "Apfelstrudel mit Vanilleeis", answer: "apple strudel with vanilla ice cream", options: ["apple cake with cream", "apple tart with chocolate", "apple pie with sauce"] },
      { dish: "Zwiebelsuppe", answer: "onion soup", options: ["mushroom soup", "potato soup", "tomato soup"] },
      { dish: "Schwarzwälder Kirschtorte", answer: "Black Forest cherry cake", options: ["chocolate mousse", "apple cake", "cheesecake"] },
      { dish: "Brezel", answer: "pretzel", options: ["bread roll", "bagel", "croissant"] },
      { dish: "Leberwurst", answer: "liver sausage/pâté", options: ["salami", "cheese spread", "chicken pâté"] },
      { dish: "Rouladen mit Knödeln", answer: "beef rolls with dumplings", options: ["stuffed peppers with rice", "meatballs with pasta", "roast beef with mashed potatoes"] },
    ],
  },

  "letter-decoder": {
    items: [
      { letter: "Liebe Maria, wie geht es dir? Mir geht es gut. Ich wohne jetzt in Berlin. Die Stadt ist sehr schön. Bitte schreib mir bald! Deine Freundin, Anna", question: "Wo wohnt Anna jetzt?", answer: "In Berlin", options: ["In Hamburg", "In München", "In Wien"] },
      { letter: "Liebe Anna, danke für deinen Brief! Mir geht es auch gut. Nächste Woche habe ich Urlaub und fahre ans Meer. Das Wetter soll schön sein. Viele Grüße, Maria", question: "Was macht Maria nächste Woche?", answer: "Sie fährt ans Meer", options: ["Sie besucht Anna", "Sie arbeitet", "Sie lernt Deutsch"] },
      { letter: "Liebe Oma und Opa, ich bin jetzt in der 5. Klasse. Meine Lieblingsfächer sind Mathe und Sport. Ich freue mich auf euren Besuch! Liebe Grüße, Euer Enkel Tim", question: "In welcher Klasse ist Tim?", answer: "5. Klasse", options: ["4. Klasse", "6. Klasse", "3. Klasse"] },
    ],
  },

  "comic-strip": {
    items: [
      { imageUrl: "", prompt: "Der Hund sieht den Apfel. Er sagt: '___'", answer: "Ich will den Apfel!", options: ["Guten Morgen!", "Ich schlafe.", "Wir gehen."] },
      { imageUrl: "", prompt: "Das Kind fragt die Mutter: '___'", answer: "Mama, was gibt es zum Mittagessen?", options: ["Ich bin Lehrer.", "Das Haus ist groß.", "Guten Abend!"] },
      { imageUrl: "", prompt: "Der Mann sieht den Regen. Er denkt: '___'", answer: "Ich brauche meinen Regenschirm!", options: ["Das Wetter ist schön.", "Ich mag Schnee.", "Guten Morgen!"] },
      { imageUrl: "", prompt: "Die Schüler sind in der Schule. Der Lehrer sagt: '___'", answer: "Heute lernen wir die Zahlen auf Deutsch.", options: ["Guten Morgen!", "Auf Wiedersehen!", "Ich bin müde."] },
      { imageUrl: "", prompt: "Im Restaurant sagt der Kellner: '___'", answer: "Guten Abend! Was möchten Sie bestellen?", options: ["Hallo, ich bin neu.", "Das Essen ist fertig.", "Die Rechnung bitte."] },
    ],
  },

  "recipe-translator": {
    items: [
      { step: "200g Mehl in eine Schüssel geben.", translation: "Put 200g of flour in a bowl." },
      { step: "Zwei Eier aufschlagen und hinzufügen.", translation: "Crack two eggs and add them." },
      { step: "250ml Milch langsam einrühren.", translation: "Slowly stir in 250ml of milk." },
      { step: "Den Teig 30 Minuten ruhen lassen.", translation: "Let the dough rest for 30 minutes." },
      { step: "Die Pfanne mit Butter einfetten.", translation: "Grease the pan with butter." },
      { step: "Den Teig in die Pfanne gießen.", translation: "Pour the batter into the pan." },
      { step: "Bei mittlerer Hitze goldbraun backen.", translation: "Bake on medium heat until golden brown." },
      { step: "Mit Puderzucker bestäuben und servieren.", translation: "Dust with powdered sugar and serve." },
    ],
  },

  "sign-language": {
    items: [
      { imageUrl: "", sign: "Notausgang", answer: "Emergency exit", options: ["No entry", "Caution", "Information"] },
      { imageUrl: "", sign: "Einbahnstraße", answer: "One-way street", options: ["No parking", "Speed limit", "Stop"] },
      { imageUrl: "", sign: "Parken verboten", answer: "No parking", options: ["Parking allowed", "Paid parking", "Loading zone"] },
      { imageUrl: "", sign: "Achtung Stufe", answer: "Watch out for step", options: ["Wet floor", "Low ceiling", "Slippery floor"] },
      { imageUrl: "", sign: "Kein Zutritt", answer: "No entry", options: ["Free entry", "Entry only", "Welcome"] },
      { imageUrl: "", sign: "Bitte nicht stören", answer: "Do not disturb", options: ["Please help yourself", "Please knock", "Come in"] },
      { imageUrl: "", sign: "Rauchen verboten", answer: "No smoking", options: ["Smoking area", "Fire exit", "No eating"] },
      { imageUrl: "", sign: "Ausfahrt freihalten", answer: "Keep exit clear", options: ["Exit only", "No parking", "Fire exit"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SOCIAL & COMPETITIVE (all use MC format)
  // ══════════════════════════════════════════════════════════════════════════

  "leaderboard-sprint": { items: BASIC_VOCAB_MC },
  "friend-challenge": { items: BASIC_VOCAB_MC },
  "team-quiz": {
    items: [
      mc("Was ist die Hauptstadt von Deutschland?", "Berlin", ["München", "Hamburg", "Frankfurt"]),
      mc("Wie sagt man 'school' auf Deutsch?", "Schule", ["Haus", "Tisch", "Buch"]),
      mc("Was bedeutet 'Auf Wiedersehen'?", "Goodbye", ["Hello", "Thank you", "Please"]),
      mc("Welcher Artikel hat 'Tisch'?", "der", ["die", "das", "ein"]),
      mc("Was ist der Plural von 'Haus'?", "Häuser", ["Hause", "Hauses", "Haus"]),
      mc("Was bedeutet 'Guten Morgen'?", "Good morning", ["Good evening", "Good night", "Goodbye"]),
      mc("Welche Zahl ist 'zwölf'?", "12", ["20", "10", "15"]),
      mc("Was bedeutet 'Ich verstehe nicht'?", "I don't understand", ["I am not here", "I don't want", "I am not ready"]),
      ...BASIC_VOCAB_MC.slice(0, 12),
    ],
  },
  "tournament-bracket": { items: BASIC_VOCAB_MC },
  "classroom-mode": {
    items: [
      mc("Wie sagt man 'pencil' auf Deutsch?", "der Bleistift", ["der Stift", "das Heft", "das Papier"]),
      mc("Was bedeutet 'das Heft'?", "exercise book / notebook", ["pencil", "ruler", "eraser"]),
      mc("Wie sagt man 'blackboard' auf Deutsch?", "die Tafel", ["das Fenster", "die Tür", "der Tisch"]),
      mc("Was bedeutet 'aufmachen'?", "to open", ["to close", "to write", "to read"]),
      mc("Wie sagt man 'homework' auf Deutsch?", "die Hausaufgaben", ["die Schule", "der Lehrer", "das Buch"]),
      ...BASIC_VOCAB_MC.slice(0, 15),
    ],
  },
  "versus-battle": { items: BASIC_VOCAB_MC },
  "weekly-challenge": {
    items: [
      mc("Was bedeutet 'Fernweh'?", "longing for distant places / wanderlust", ["fear of heights", "love of food", "sadness"]),
      mc("Was bedeutet 'Gemütlichkeit'?", "cosiness / warmth and friendliness", ["cleanliness", "punctuality", "efficiency"]),
      mc("Wie heißt Deutschland auf Englisch?", "Germany", ["Austria", "Switzerland", "Denmark"]),
      mc("Was ist 'Schwarzbrot'?", "dark rye bread", ["chocolate cake", "black coffee", "dark beer"]),
      mc("Was feiert man am 3. Oktober in Deutschland?", "Tag der Deutschen Einheit (German Unity Day)", ["Christmas", "Easter", "New Year"]),
      ...BASIC_VOCAB_MC.slice(0, 10),
    ],
  },
};

async function main() {
  await connectDB();
  console.log("Connected. Seeding content for all 97 games…\n");

  let updated = 0;
  let skipped = 0;

  for (const [slug, content] of Object.entries(CONTENT)) {
    const res = await Game.updateOne({ slug }, { $set: { content } });
    if (res.matchedCount > 0) {
      updated++;
      console.log(`✓  ${slug}`);
    } else {
      skipped++;
      console.log(`⚠  ${slug} — game document not found (run npm run seed first)`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
