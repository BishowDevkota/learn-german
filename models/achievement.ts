import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AchievementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Award" },
    xpReward: { type: Number, default: 0 },
    tier: { type: String, enum: ["bronze", "silver", "gold", "platinum"], default: "bronze" },
  },
  { timestamps: true }
);

export type AchievementDoc = InferSchemaType<typeof AchievementSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Achievement: Model<AchievementDoc> =
  (mongoose.models.Achievement as Model<AchievementDoc>) ||
  mongoose.model<AchievementDoc>("Achievement", AchievementSchema);

export default Achievement;
