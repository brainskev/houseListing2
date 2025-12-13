import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;

    // Only admin and assistant can view all users
    if (!["admin", "assistant"].includes(sessionUser?.user?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const users = await User.find({})
      .select("name email username role status createdAt image")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}
