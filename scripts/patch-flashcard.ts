/**
 * One-off script: replace flashcard-flip content with 20 vocabulary cards.
 * Run with:  npm run seed  (or separately via tsx)
 */
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import Game from "../models/game";

const CARDS = [
  { german: "der Hund", english: "the dog", imageUrl: "", imagePublicId: "" },
  { german: "die Katze", english: "the cat", imageUrl: "", imagePublicId: "" },
  { german: "das Haus", english: "the house", imageUrl: "", imagePublicId: "" },
  { german: "der Apfel", english: "the apple", imageUrl: "", imagePublicId: "" },
  { german: "die Sonne", english: "the sun", imageUrl: "", imagePublicId: "" },
  { german: "das Buch", english: "the book", imageUrl: "", imagePublicId: "" },
  { german: "der Tisch", english: "the table", imageUrl: "", imagePublicId: "" },
  { german: "die Schule", english: "the school", imageUrl: "", imagePublicId: "" },
  { german: "das Auto", english: "the car", imageUrl: "", imagePublicId: "" },
  { german: "der Freund", english: "the friend (m)", imageUrl: "", imagePublicId: "" },
  { german: "die Mutter", english: "the mother", imageUrl: "", imagePublicId: "" },
  { german: "der Vater", english: "the father", imageUrl: "", imagePublicId: "" },
  { german: "das Kind", english: "the child", imageUrl: "", imagePublicId: "" },
  { german: "die Stadt", english: "the city", imageUrl: "", imagePublicId: "" },
  { german: "der Baum", english: "the tree", imageUrl: "", imagePublicId: "" },
  { german: "das Wasser", english: "the water", imageUrl: "", imagePublicId: "" },
  { german: "die Blume", english: "the flower", imageUrl: "", imagePublicId: "" },
  { german: "der Vogel", english: "the bird", imageUrl: "", imagePublicId: "" },
  { german: "das Fenster", english: "the window", imageUrl: "", imagePublicId: "" },
  { german: "die Straße", english: "the street", imageUrl: "", imagePublicId: "" },
];

async function main() {
  await connectDB();
  await Game.updateOne(
    { slug: "flashcard-flip" },
    { $set: { content: { cards: CARDS }, isActive: true } }
  );
  console.log(`✓ flashcard-flip updated with ${CARDS.length} cards`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
