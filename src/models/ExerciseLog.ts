import mongoose, { Schema, Document } from "mongoose";

export interface ISet {
  reps: number;
  weightKg: number;
}

export interface IExerciseLog extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  exerciseName: string;
  muscleGroup: string;
  sets: ISet[];
  volumeKg: number;
  isPR: boolean;
}

const SetSchema = new Schema<ISet>(
  {
    reps: { type: Number, required: true },
    weightKg: { type: Number, required: true },
  },
  { _id: false },
);

const ExerciseLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  exerciseName: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  sets: { type: [SetSchema], required: true },
  volumeKg: { type: Number, required: true, default: 0 },
  isPR: { type: Boolean, required: true, default: false },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.ExerciseLog ||
  mongoose.model<IExerciseLog>("ExerciseLog", ExerciseLogSchema);
