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
    const baseFilter = { recipient: userId };
    if (since) {
      baseFilter.createdAt = { $gt: since };
    }

    // Keep unread-first ordering while supporting delta fetches
    const unreadMessages = await Message.find({ ...baseFilter, read: false })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("property", "name");

    const readMessages = await Message.find({ ...baseFilter, read: true })
      .sort({ createdAt: -1 })
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
