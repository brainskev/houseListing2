import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import Enquiry from "@/models/Enquiry";

export const dynamic = "force-dynamic";

const allowedStatuses = ["new", "contacted", "closed"];

export async function PATCH(_request, { params }) {
  const { id } = params || {};
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    const role = sessionUser?.user?.role;
    if (!role || !["admin", "assistant"].includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await _request.json();
    const { status } = body || {};

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updated = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry: updated }, { status: 200 });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json({ message: "Failed to update enquiry" }, { status: 500 });
  }
}
