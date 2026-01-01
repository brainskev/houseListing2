import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

//GET /api/messages/unread-count
export const GET = async (request) => {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.user) {
      return new Response(
        JSON.stringify({ message: "You must be loggedIn to send a message" }),
        { status: 401 }
      );
    }
    //Extract user object from session user
    const { userId } = sessionUser;

    // Build query to exclude active thread if parameters are provided
    const { searchParams } = new URL(request.url);
    const excludeProperty = searchParams.get("excludeProperty");
    const excludeCounterpart = searchParams.get("excludeCounterpart");

    const query = {
      recipient: userId,
      read: false,
    };

    // If both property and counterpart are specified, exclude that specific thread
    if (excludeProperty && excludeCounterpart) {
      query.$or = [
        { property: { $ne: excludeProperty } },
        { sender: { $ne: excludeCounterpart } },
      ];
    }

    const unreadMessagesCount = await Message.countDocuments(query);

    return new Response(JSON.stringify({ count: unreadMessagesCount }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("something went wrong", { status: 500 });
  }
};
