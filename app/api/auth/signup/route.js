import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import {
  hashPassword,
  validateSignupData,
  normalizeEmail,
  getSafeErrorMessage,
} from "@/utils/authHelpers";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, image } = body || {};

    // Validate input data
    const validation = validateSignupData({ name, email, password });
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const username = name?.slice(0, 20) || normalizedEmail.split("@")[0];

    // Create user
    const user = await User.create({
      name,
      username,
      email: normalizedEmail,
      hashedPassword,
      role: "user",
      image: image || null,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name || user.username,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    const message = getSafeErrorMessage(error, "Unable to create account");
    return NextResponse.json({ message }, { status: 500 });
  }
}
