import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  weight?: number;
  daysPerWeek: number;
  preferredCardio: string;
  xp: number;
  level: number;
  activityStreak: number;
  perfectStreak: number;
  shields: number;
  lastSessionDate?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  weight: { type: Number },
  daysPerWeek: { type: Number, required: true, enum: [3, 4, 5, 6] },
  preferredCardio: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  activityStreak: { type: Number, default: 0 },
  perfectStreak: { type: Number, default: 0 },
  shields: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
