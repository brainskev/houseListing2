import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import Enquiry from "@/models/Enquiry";

const allowedStatuses = ["new", "contacted", "closed"];

export async function POST(request) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    if (!sessionUser?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, message, propertyId } = body || {};

    if (!name || !phone || !message) {
      return NextResponse.json(
        { message: "Name, phone, and message are required" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.create({
      userId: sessionUser.userId,
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
      ...(propertyId ? { propertyId } : {}),
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("Create enquiry error:", error);
    return NextResponse.json({ message: "Failed to create enquiry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    const role = sessionUser?.user?.role;
    const userId = sessionUser?.userId;

    let query = {};
    if (!role || !["admin", "assistant"].includes(role)) {
      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      query = { userId };
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ enquiries }, { status: 200 });
  } catch (error) {
    console.error("Get enquiries error:", error);
    return NextResponse.json({ message: "Failed to fetch enquiries" }, { status: 500 });
  }
}
