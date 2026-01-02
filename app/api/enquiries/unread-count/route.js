import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import Enquiry from "@/models/Enquiry";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();
        const session = await getSessionUser();
        if (session instanceof Response) return session;

        const userId = session.userId;

        // Fetch all enquiries where user is participant
        const enquiries = await Enquiry.find({
            participants: userId,
        }).select('unreadCountByUser').lean();

        // Sum up unread counts for this user
        const count = enquiries.reduce((sum, enquiry) => {
            return sum + (enquiry?.unreadCountByUser?.[userId] || 0);
        }, 0);

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Unread count error", error);
        return NextResponse.json({ message: "Failed to fetch unread count" }, { status: 500 });
    }
}
