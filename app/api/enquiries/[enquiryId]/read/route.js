import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import { markEnquiryRead } from "@/lib/chatService";

export const dynamic = "force-dynamic";

function errorJson(message, status = 400) {
    return NextResponse.json({ message }, { status });
}

export async function POST(request, { params }) {
    try {
        await connectDB();
        const session = await getSessionUser();
        if (session instanceof Response) return session;

        const { enquiryId } = params || {};
        const enquiry = await markEnquiryRead({ enquiryId, userId: session.userId, session });
        return NextResponse.json({ enquiry });
    } catch (error) {
        console.error("Mark enquiry read error", error);
        const status = error.status || 500;
        const message = error.status ? error.message : "Failed to mark chat as read";
        return errorJson(message, status);
    }
}
