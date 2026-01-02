import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";
// --- Sanitization helpers ---
function sanitizeText(value, maxLen) {
  const s = (typeof value === "string" ? value : "").trim();
  return s.replace(/[\r\n\t]+/g, " ").replace(/[<>]/g, "").slice(0, maxLen);
}

function validateEmail(email) {
  const s = (typeof email === "string" ? email : "").trim();
  return /.+@.+\..+/.test(s) && s.length <= 254;
}

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}
//GET /api/messages
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

    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const since = sinceParam && !Number.isNaN(Date.parse(sinceParam)) ? new Date(sinceParam) : null;

    const { userId } = sessionUser;

    // Always fetch all unread messages (important for read status updates)
    const unreadMessages = await Message.find({ recipient: userId, read: false })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("property", "name");

    // Apply delta filter only to read messages
    const readFilter = { recipient: userId, read: true };
    if (since) {
      // use updatedAt so status changes (read/unread) are picked up after updates
      readFilter.updatedAt = { $gt: since };
    }

    const readMessages = await Message.find(readFilter)
      .sort({ updatedAt: -1 })
      .populate("sender", "username")
      .populate("property", "name");

    const messages = [...unreadMessages, ...readMessages];
    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Something Went Wrong" }), {
      status: 500,
    });
  }
};

// PATCH /api/messages - Mark thread as read by property and sender
export const PATCH = async (request) => {
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
    const { propertyId, senderId } = await request.json();

    console.log('[API PATCH] === START ===');
    console.log('[API PATCH] Input:', { userId, propertyId, senderId });

    if (!propertyId || !senderId) {
      console.log('[API PATCH] ERROR: Missing parameters');
      return new Response(
        JSON.stringify({ message: "propertyId and senderId required" }),
        { status: 400 }
      );
    }

    // Find all unread messages for this thread and mark as read
    // Convert IDs to ObjectId for proper MongoDB comparison
    const query = {
      recipient: new Types.ObjectId(userId),
      read: false,
      property: new Types.ObjectId(propertyId),
      sender: new Types.ObjectId(senderId),
    };

    console.log('[API PATCH] Query:', {
      recipient: userId,
      read: false,
      property: propertyId,
      sender: senderId,
    });

    // Check how many messages match
    const matchCount = await Message.countDocuments(query);
    console.log('[API PATCH] Matched count:', matchCount);

    // Get the actual messages that match
    const matchedMessages = await Message.find(query).select('_id read sender property');
    console.log('[API PATCH] Matched messages:', matchedMessages.map(m => ({ id: m._id, read: m.read, sender: m.sender, property: m.property })));

    const result = await Message.updateMany(query, { $set: { read: true } });

    console.log('[API PATCH] Result:', { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
    console.log('[API PATCH] === END ===');

    return new Response(
      JSON.stringify({
        message: "Thread marked as read",
        updated: result.modifiedCount
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log('[API PATCH] ERROR:', error);
    return new Response(JSON.stringify({ message: "Something Went Wrong" }), {
      status: 500,
    });
  }
};

//POST /api/messages
export const POST = async (request) => {
  try {
    await connectDB();
    const { name, email, phone, message, recipient, property, hp } =
      await request.json();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.user) {
      return new Response(
        JSON.stringify({ message: "You must be loggedIn to send a message" }),
        { status: 401 }
      );
    }
    //Extract user object from session user
    const { user } = sessionUser;
    //Check User cann't send message to self
    if (user.id === recipient) {
      return new Response(
        JSON.stringify({ message: "User cann't send message to self" }),
        { status: 400 }
      );
    }

    // Reject bots that fill the hidden honeypot field
    if (hp && String(hp).trim().length > 0) {
      return new Response(JSON.stringify({ message: "Invalid submission" }), { status: 400 });
    }

    // Validate inputs
    const safeName = sanitizeText(name, 100);
    const safePhone = sanitizeText(phone, 32);
    const safeBody = sanitizeText(message, 2000);
    const safeEmail = (email || "").trim();

    if (!safeBody || !recipient) {
      return new Response(JSON.stringify({ message: "Message body and recipient are required" }), { status: 400 });
    }
    if (safeEmail && !validateEmail(safeEmail)) {
      return new Response(JSON.stringify({ message: "Invalid email" }), { status: 400 });
    }

    // Validate IDs are valid ObjectIds
    if (!isValidObjectId(user.id)) {
      return new Response(JSON.stringify({ message: "Invalid sender ID" }), { status: 400 });
    }
    if (!isValidObjectId(recipient)) {
      return new Response(JSON.stringify({ message: "Invalid recipient ID" }), { status: 400 });
    }
    if (property && !isValidObjectId(property)) {
      return new Response(JSON.stringify({ message: "Invalid property ID" }), { status: 400 });
    }

    const newMessage = new Message({
      sender: user.id,
      recipient,
      property: property || null,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      body: safeBody,
    });

    await newMessage.save();

    return new Response(
      JSON.stringify({ message: "Message Sent Successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Something Went Wrong" }), {
      status: 500,
    });
  }
};
