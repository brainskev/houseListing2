import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// GET /api/messages/sent - messages (enquiries) sent by current user
export const GET = async (request) => {
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
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const since = sinceParam && !Number.isNaN(Date.parse(sinceParam)) ? new Date(sinceParam) : null;

    const filter = { sender: userId };
    if (since) {
      filter.createdAt = { $gt: since };
    }

    const messages = await Message.find(filter)
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
