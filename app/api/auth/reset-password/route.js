import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import {
  hashPassword,
  validatePassword,
  isTokenExpired,
  getSafeErrorMessage,
} from "@/utils/authHelpers";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, password } = body || {};

    if (!token) {
      return NextResponse.json(
        { message: "Reset token is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const user = await User.findOne({ resetToken: token }).select(
      "+resetToken +resetTokenExpiry +hashedPassword"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || isTokenExpired(user.resetTokenExpiry)) {
      return NextResponse.json(
        { message: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    user.hashedPassword = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password has been reset successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    const message = getSafeErrorMessage(error, "Unable to reset password");
    return NextResponse.json({ message }, { status: 500 });
  }
}
