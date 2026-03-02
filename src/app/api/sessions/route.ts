import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Session from "@/models/Session";
import User from "@/models/User";
import ExerciseLog from "@/models/ExerciseLog";
import { calculateSessionXp } from "@/lib/xp";
import { getAuthSession } from "@/lib/auth";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isConsecutiveDay(last: Date, today: Date) {
  const diff = today.getTime() - last.getTime();
  const dayMs = 1000 * 3600 * 24;
  return diff >= dayMs && diff < dayMs * 2;
}

export async function GET() {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || !sessionAuth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(sessionAuth.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    const sessions = await Session.find({ userId: user._id }).sort({
      date: -1,
    });
    return NextResponse.json({ sessions }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || !sessionAuth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    const user = await User.findById(sessionAuth.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { splitType, cardioDone, cardioDuration } = body;
    const sessionDate = new Date(body.date || new Date());

    // Perfect = has split + cardio >= 10 min
    const isPerfect =
      !!splitType && splitType !== "NONE" && cardioDone && cardioDuration >= 10;

    // Calculate XP
    const { total: xpEarned } = calculateSessionXp({
      ...body,
      date: sessionDate,
    });

    // Create session
    const session = await Session.create({
      ...body,
      userId: user._id,
      isPerfect,
      xpEarned,
      date: sessionDate,
    });

    // --- Streak logic ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = user.lastSessionDate
      ? new Date(user.lastSessionDate)
      : null;

    let newStreak = user.activityStreak;
    let newPerfectStreak = user.perfectStreak;

    if (!lastDate) {
      // First session ever — start streak at 1
      newStreak = 1;
    } else if (isSameDay(lastDate, today)) {
      // Already logged today — streak unchanged
    } else if (isConsecutiveDay(lastDate, today)) {
      // Logged yesterday — extend streak
      newStreak += 1;
    } else {
      // Gap of more than 1 day — reset streak
      newStreak = 1;
    }
    // Same-day logging doesn't change streak

    if (isPerfect) {
      newPerfectStreak =
        lastDate && isSameDay(lastDate, today)
          ? user.perfectStreak
          : user.perfectStreak + 1;
    } else {
      newPerfectStreak = 0;
    }

    // Shield award: every 7-day streak milestone
    const prevShieldThreshold = Math.floor(user.activityStreak / 7);
    const newShieldThreshold = Math.floor(newStreak / 7);
    const shieldEarned = Math.max(0, newShieldThreshold - prevShieldThreshold);

    // Update user
    await User.findByIdAndUpdate(user._id, {
      $inc: { xp: xpEarned, shields: shieldEarned },
      activityStreak: newStreak,
      perfectStreak: newPerfectStreak,
      lastSessionDate: isSameDay(lastDate || new Date(0), today)
        ? user.lastSessionDate
        : today,
    });

    // Persist exercise logs if provided
    let exerciseLogs: (typeof ExerciseLog)[] = [];
    if (
      body.exercises &&
      Array.isArray(body.exercises) &&
      body.exercises.length > 0
    ) {
      exerciseLogs = await Promise.all(
        body.exercises.map(
          async (ex: {
            name: string;
            muscleGroup: string;
            sets: { reps: number; weightKg: number }[];
          }) => {
            const volumeKg = ex.sets.reduce(
              (s: number, set) => s + set.reps * set.weightKg,
              0,
            );
            const best = await ExerciseLog.findOne({
              userId: user._id,
              exerciseName: { $regex: new RegExp(`^${ex.name}$`, "i") },
            })
              .sort({ volumeKg: -1 })
              .select("volumeKg");
            const isPR = !best || volumeKg > (best.volumeKg || 0);
            return ExerciseLog.create({
              userId: user._id,
              sessionId: session._id,
              exerciseName: ex.name,
              muscleGroup: ex.muscleGroup,
              sets: ex.sets,
              volumeKg,
              isPR,
            });
          },
        ),
      );
    }

    return NextResponse.json(
      { session, xpEarned, newStreak, shieldEarned, exerciseLogs },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
