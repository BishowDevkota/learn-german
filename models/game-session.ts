import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const GameSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gameSlug: { type: String, required: true, index: true },
    score: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

export type GameSessionDoc = InferSchemaType<typeof GameSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GameSession: Model<GameSessionDoc> =
  (mongoose.models.GameSession as Model<GameSessionDoc>) ||
  mongoose.model<GameSessionDoc>("GameSession", GameSessionSchema);

export default GameSession;
