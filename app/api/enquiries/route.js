import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import { createEnquiryWithMessage, listEnquiriesForUser } from "@/lib/chatService";

export const dynamic = "force-dynamic";

function errorJson(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getSessionUser();
    if (session instanceof Response) return session;

    const body = await request.json();
    const { propertyId, message, hp, contactName, contactEmail, contactPhone } = body || {};

    if (hp && String(hp).trim().length > 0) {
      return errorJson("Invalid submission", 400);
    }

    if (!propertyId || !message) {
      return errorJson("propertyId and message are required", 400);
    }

    const { enquiry, message: createdMessage } = await createEnquiryWithMessage({
      propertyId,
      senderId: session.userId,
      text: message,
      contactInfo: {
        name: contactName || session.user?.name || "",
        email: contactEmail || session.user?.email || "",
        phone: contactPhone || "",
      },
      session,
    });

    return NextResponse.json({ enquiry, message: createdMessage }, { status: 201 });
  } catch (error) {
    console.error("Create enquiry error", error);
    const status = error.status || 500;
    const message = error.status ? error.message : "Failed to create enquiry";
    return errorJson(message, status);
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await getSessionUser();
    if (session instanceof Response) return session;

    const enquiries = await listEnquiriesForUser({ userId: session.userId, role: session.user?.role });
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("List enquiries error", error);
    return errorJson("Failed to fetch enquiries", 500);
  }
}
