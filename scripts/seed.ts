/**
 * Seed script — run with:  npm run seed
 *
 * Creates the admin account, achievement definitions, and a Game document for
 * each of the 97 registry games. Idempotent: the admin and achievements are
 * upserted; game metadata is refreshed from the registry on every run, while a
 * game's editable `content` is only set when the document is first inserted
 * (so re-seeding never clobbers content you've added in the admin).
 *
 * Real sample content ships for the reference games; the rest start empty and
 * are filled in via the admin editor (or a later content pass).
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import User from "../models/user";
import Achievement from "../models/achievement";
import Game from "../models/game";
import { ACHIEVEMENTS } from "../lib/gamification";
import { GAMES } from "../lib/games/registry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SAMPLE_CONTENT: Record<string, Record<string, any>> = {
  "flashcard-flip": {
    cards: [
      { german: "der Hund", english: "the dog", imageUrl: "", imagePublicId: "" },
      { german: "die Katze", english: "the cat", imageUrl: "", imagePublicId: "" },
      { german: "das Haus", english: "the house", imageUrl: "", imagePublicId: "" },
      { german: "der Apfel", english: "the apple", imageUrl: "", imagePublicId: "" },
      { german: "die Sonne", english: "the sun", imageUrl: "", imagePublicId: "" },
      { german: "das Buch", english: "the book", imageUrl: "", imagePublicId: "" },
    ],
  },
  "picture-vocabulary": {
    items: [
      { imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400", imagePublicId: "", correctWord: "der Hund", options: ["die Katze", "das Pferd", "der Vogel"] },
      { imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400", imagePublicId: "", correctWord: "die Katze", options: ["der Hund", "der Fisch", "die Maus"] },
      { imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400", imagePublicId: "", correctWord: "der Vogel", options: ["die Katze", "der Hund", "das Pferd"] },
    ],
  },
};

async function main() {
  await connectDB();
  console.log("Connected to MongoDB");

  // Admin account
  const email = process.env.ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "admin@german.app";
  const password = process.env.ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" }, $setOnInsert: { name: "Admin", password: hash } },
    { upsert: true }
  );
  console.log(`Admin ready: ${email} / ${password}`);

  // Achievements
  for (const a of ACHIEVEMENTS) {
    await Achievement.updateOne(
      { key: a.key },
      { $set: { title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward, tier: a.tier } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);

  // Games — one document per registry entry.
  let inserted = 0;
  for (const g of GAMES) {
    const content = SAMPLE_CONTENT[g.slug] ?? { [g.itemsKey]: [] };
    const res = await Game.updateOne(
      { slug: g.slug },
      {
        $set: {
          title: g.title,
          category: g.category,
          description: g.description,
          difficulty: g.difficulty,
        },
        $setOnInsert: { isActive: true, thumbnailUrl: "", thumbnailPublicId: "", content },
      },
      { upsert: true }
    );
    if (res.upsertedCount) inserted++;
  }
  console.log(`Games: ${GAMES.length} total, ${inserted} newly inserted`);

  await mongoose.disconnect();
  console.log("Done ✅");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
