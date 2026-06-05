import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DIFFICULTIES } from "@/lib/validations";

/**
 * One document per game. Static metadata (title, category, difficulty, icon)
 * also lives in the code registry (`lib/games/registry.ts`); the DB row is the
 * source of truth for admin-editable state: `isActive`, the thumbnail, and the
 * freeform `content` payload whose shape varies per game type.
 *
 * Every image stored inside `content` must carry BOTH a `*Url` and a
 * `*PublicId` so it can be deleted/replaced in Cloudinary (see lib/cloudinary).
 */
const GameSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    difficulty: { type: String, enum: DIFFICULTIES, default: "beginner" },
    isActive: { type: Boolean, default: true, index: true },
    thumbnailUrl: { type: String, default: "" },
    thumbnailPublicId: { type: String, default: "" },
    // Flexible per-game payload, e.g. { cards: [...] } | { sentences: [...] }.
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export type GameDoc = InferSchemaType<typeof GameSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Game: Model<GameDoc> =
  (mongoose.models.Game as Model<GameDoc>) ||
  mongoose.model<GameDoc>("Game", GameSchema);

export default Game;
