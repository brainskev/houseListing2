import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";
import { Types } from "mongoose";

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
      recipient: new Types.ObjectId(userId),
      read: false,
    };

    // If both property and counterpart are specified, exclude only that exact thread
    if (excludeProperty && excludeCounterpart && Types.ObjectId.isValid(excludeProperty) && Types.ObjectId.isValid(excludeCounterpart)) {
      query.$nor = [
        {
          property: new Types.ObjectId(excludeProperty),
          sender: new Types.ObjectId(excludeCounterpart),
        },
      ];
    }

    const unreadMessagesCount = await Message.countDocuments(query);

    // Debug: surface which threads still unread to trace why counts persist
    if (unreadMessagesCount > 0) {
      const unreadDocs = await Message.find(query)
        .select('_id sender property createdAt')
        .sort({ createdAt: -1 })
        .limit(10);
      console.log('[API UNREAD COUNT] query:', query, 'count:', unreadMessagesCount, 'sample:', unreadDocs.map(d => ({ id: d._id, sender: d.sender, property: d.property, createdAt: d.createdAt })));
    } else {
      console.log('[API UNREAD COUNT] query:', query, 'count:', unreadMessagesCount);
    }

    return new Response(JSON.stringify({ count: unreadMessagesCount }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("something went wrong", { status: 500 });
  }
};
