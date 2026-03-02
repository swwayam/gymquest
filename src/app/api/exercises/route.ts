import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import ExerciseLog from "@/models/ExerciseLog";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const library = searchParams.get("library");

    await dbConnect();
    const user = await User.findOne();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Return distinct exercises ever logged by this user (for autocomplete library)
    if (library === "true") {
      const all = await ExerciseLog.find({ userId: user._id })
        .select("exerciseName muscleGroup")
        .lean();

      // Deduplicate by exerciseName (case-insensitive), keep latest muscleGroup
      const seen = new Map<string, string>();
      for (const e of all) {
        const key = (e.exerciseName as string).toLowerCase();
        if (!seen.has(key)) seen.set(key, e.muscleGroup as string);
      }
      const exercises = Array.from(seen.entries()).map(
        ([name, muscleGroup]) => ({
          exerciseName: name
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          muscleGroup,
        }),
      );
      return NextResponse.json({ exercises }, { status: 200 });
    }

    // Return logs for a specific session
    if (sessionId) {
      const logs = await ExerciseLog.find({
        userId: user._id,
        sessionId,
      }).lean();
      return NextResponse.json({ logs }, { status: 200 });
    }

    // Return ALL exercise logs (for stats / history)
    const logs = await ExerciseLog.find({ userId: user._id })
      .sort({ date: -1 })
      .lean();
    return NextResponse.json({ logs }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // body: { sessionId, exercises: [{ name, muscleGroup, sets: [{reps, weightKg}] }] }
    await dbConnect();

    const user = await User.findOne();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const created = await Promise.all(
      (body.exercises || []).map(async (ex: any) => {
        const volumeKg = (ex.sets || []).reduce(
          (sum: number, s: any) => sum + s.reps * s.weightKg,
          0,
        );

        // PR detection: best volumeKg for this exercise name
        const best = await ExerciseLog.findOne({
          userId: user._id,
          exerciseName: { $regex: new RegExp(`^${ex.name}$`, "i") },
        })
          .sort({ volumeKg: -1 })
          .select("volumeKg");

        const isPR = !best || volumeKg > (best.volumeKg || 0);

        return ExerciseLog.create({
          userId: user._id,
          sessionId: body.sessionId,
          exerciseName: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          volumeKg,
          isPR,
        });
      }),
    );

    return NextResponse.json({ logs: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to log exercises" },
      { status: 500 },
    );
  }
}
