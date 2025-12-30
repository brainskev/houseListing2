import connectDB from "@/config/db";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";

// GET /api/users - list users (admin or assistant only)
export const GET = async () => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;

    const role = sessionUser?.user?.role;
    if (!role || !["admin", "assistant"].includes(role)) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    const users = await User.find({})
      .select("name email username role status createdAt image")
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to list users:", error);
    return new Response(JSON.stringify({ message: "Something went wrong" }), { status: 500 });
  }
};
