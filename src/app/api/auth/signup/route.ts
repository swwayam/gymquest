import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { setAuthCookie, signToken } from "@/lib/auth";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, weight, daysPerWeek, preferredCardio } =
      body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use." },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      weight: weight ? Number(weight) : undefined,
      daysPerWeek: Number(daysPerWeek) || 4,
      preferredCardio: preferredCardio || "None",
    });

    // Generate JWT and set cookie
    const token = await signToken({ userId: user._id });
    await setAuthCookie(token);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 },
    );
  }
}
