import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import Enquiry from "@/models/Enquiry";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

const allowedStatuses = ["new", "contacted", "closed"];

function isValidObjectId(id) {
  return Types.ObjectId.isValid(id);
}

// PUT /api/enquiries/:id - Update enquiry status (for user-initiated updates like marking as seen/contacted)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ID is a valid ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid enquiry ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return NextResponse.json({ message: "Enquiry not found" }, { status: 404 });
    }

    // Only allow status updates, and validate the status value
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ message: "Invalid status" }, { status: 400 });
      }
      enquiry.status = status;
    }

    await enquiry.save();
    return NextResponse.json(enquiry, { status: 200 });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json({ message: "Failed to update enquiry" }, { status: 500 });
  }
}

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
