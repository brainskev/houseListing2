import connectDB from "@/config/db";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

//PUT /api/messages/:id
export const PUT = async (request, { params }) => {
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
    const { id } = params;

    // Validate ID is a valid ObjectId
    if (!isValidObjectId(id)) {
      return new Response(JSON.stringify({ message: "Invalid message ID" }), { status: 400 });
    }

    const message = await Message.findById(id);
    if (!message)
      return new Response(JSON.stringify({ message: "Message not found" }), {
        status: 404,
      });

    //Verify Ownership
    if (message.recipient.toString() !== userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // update message status to read (toggle functionality kept for toggle use case elsewhere)
    message.read = !message.read;
    await message.save();

    return new Response(JSON.stringify(message), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("something went wrong", { status: 500 });
  }
};

//Delete /api/messages/:id
export const DELETE = async (request, { params }) => {
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
    const { id } = params;

    // Validate ID is a valid ObjectId
    if (!isValidObjectId(id)) {
      return new Response(JSON.stringify({ message: "Invalid message ID" }), { status: 400 });
    }

    const message = await Message.findById(id);
    if (!message)
      return new Response(JSON.stringify({ message: "Message not found" }), {
        status: 404,
      });

    //Verify Ownership
    if (message.recipient.toString() !== userId) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // update message status to read/unread depending on current status
    await message.deleteOne();
    return new Response(
      JSON.stringify({ message: "Message deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response("something went wrong", { status: 500 });
  }
};
