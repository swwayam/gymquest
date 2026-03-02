import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  splitType?: "PUSH" | "PULL" | "LEGS" | "NONE";
  splitDuration?: number;
  splitNotes?: string;
  cardioDone: boolean;
  cardioType?: string;
  cardioDuration?: number;
  cardioNotes?: string;
  xpEarned: number;
  isPerfect: boolean;
}

const SessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  splitType: { type: String, enum: ["PUSH", "PULL", "LEGS", "NONE"] },
  splitDuration: { type: Number },
  splitNotes: { type: String },
  cardioDone: { type: Boolean, default: false },
  cardioType: { type: String },
  cardioDuration: { type: Number },
  cardioNotes: { type: String },
  xpEarned: { type: Number, required: true, default: 0 },
  isPerfect: { type: Boolean, required: true, default: false },
});

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
