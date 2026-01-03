import { getServerSession } from "next-auth/next";
import authOptions from "@/utils/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";

export const getSessionUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // CRITICAL: Verify user actually exists in database
    await connectDB();
    const userExists = await User.findById(session.user.id).select("_id role");

    if (!userExists) {
      console.warn(`Session found for non-existent user: ${session.user.id}`);
      return new Response("User not found", { status: 404 });
    }

    return {
      user: {
        ...session.user,
        role: userExists.role, // Use role from DB, not session (more secure)
      },
      userId: session.user.id,
    };
  } catch (error) {
    console.error("getSessionUser error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
