import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import { appendMessage, getEnquiryMessages } from "@/lib/chatService";

export const dynamic = "force-dynamic";

function errorJson(message, status = 400) {
    return NextResponse.json({ message }, { status });
}

export async function GET(request, { params }) {
    try {
        await connectDB();
        const session = await getSessionUser();
        if (session instanceof Response) return session;

        const { enquiryId } = params || {};
        const { enquiry, messages } = await getEnquiryMessages(enquiryId, session);
        return NextResponse.json({ enquiry, messages });
    } catch (error) {
        console.error("Get enquiry messages error", error);
        const status = error.status || 500;
        const message = error.status ? error.message : "Failed to fetch messages";
        return errorJson(message, status);
    }
}

export async function POST(request, { params }) {
    try {
        await connectDB();
        const session = await getSessionUser();
        if (session instanceof Response) return session;

        const { enquiryId } = params || {};
        const body = await request.json();
        const { text } = body || {};

        if (!text || !text.trim()) {
            return errorJson("Message text is required", 400);
        }

        const { enquiry, message } = await appendMessage({ enquiryId, senderId: session.userId, text, session });
        return NextResponse.json({ enquiry, message }, { status: 201 });
    } catch (error) {
        console.error("Create message error", error);
        const status = error.status || 500;
        const message = error.status ? error.message : "Failed to create message";
        return errorJson(message, status);
    }
}
