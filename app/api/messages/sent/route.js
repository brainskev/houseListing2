import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// GET /api/messages/sent - messages (enquiries) sent by current user
export const GET = async () => {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.user) {
      return new Response(
        JSON.stringify({ message: "You must be loggedIn" }),
        { status: 401 }
      );
    }
    const { userId } = sessionUser;

    const messages = await Message.find({ sender: userId })
      .sort({ createdAt: -1 })
      .populate("recipient", "username")
      .populate("property", "name location images rates type");

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Something Went Wrong" }), {
      status: 500,
    });
  }
};
