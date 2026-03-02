import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import WeightLog from "@/models/WeightLog";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    const user = await User.findOne();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const logs = await WeightLog.find({ userId: user._id }).sort({ date: -1 });
    return NextResponse.json({ logs }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weight logs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    const user = await User.findOne();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const log = await WeightLog.create({
      userId: user._id,
      weight: body.weight,
      date: body.date ? new Date(body.date) : new Date(),
      note: body.note || undefined,
    });

    // Update user's current weight to the latest entry
    await User.findByIdAndUpdate(user._id, { weight: body.weight });

    return NextResponse.json({ log }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to log weight" },
      { status: 500 },
    );
  }
}
