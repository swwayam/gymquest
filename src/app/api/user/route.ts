import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await dbConnect();
    if (id) {
      const user = await User.findById(id);
      return NextResponse.json({ user }, { status: 200 });
    }
    const user = await User.findOne();
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      const user = await User.findOneAndUpdate({}, body, { new: true });
      return NextResponse.json({ user }, { status: 200 });
    }
    const user = await User.create(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
