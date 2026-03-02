import mongoose, { Schema, Document } from "mongoose";

export interface IWeightLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight: number;
  note?: string;
}

const WeightLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  weight: { type: Number, required: true },
  note: { type: String },
});

export default mongoose.models.WeightLog ||
  mongoose.model<IWeightLog>("WeightLog", WeightLogSchema);
