import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import {
  generateResetToken,
  generateResetTokenExpiry,
  normalizeEmail,
  isValidEmail,
  getSafeErrorMessage,
} from "@/utils/authHelpers";
import { sendPasswordResetEmail } from "@/utils/emailService";

// Rate limiting store (use Redis in production)
const resetAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;

function checkRateLimit(email) {
  const now = Date.now();
  const attempts = resetAttempts.get(email) || [];

  // Filter out old attempts
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false;
  }

  recentAttempts.push(now);
  resetAttempts.set(email, recentAttempts);
  return true;
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body || {};

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { message: "Too many reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      const resetToken = generateResetToken();
      const resetTokenExpiry = generateResetTokenExpiry();

      // Save reset token to database
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      // Build reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/reset-password?token=${resetToken}`;

      // Send email with reset link
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
        console.log("Password reset email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        // Log error but don't expose it to user (prevents email enumeration)
        // Also log the reset URL as fallback for development
        console.log("Fallback - Password reset link:", resetUrl);
      }
    }

    // Always return success message for security
    return NextResponse.json(
      {
        message: "If an account exists with this email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    const message = getSafeErrorMessage(error, "Unable to process request");
    return NextResponse.json({ message }, { status: 500 });
  }
}
