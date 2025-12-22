import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import ViewingAppointment from "@/models/ViewingAppointment";

const allowedStatuses = ["pending", "confirmed", "completed"];

export async function PATCH(request, { params }) {
  const { id } = params || {};
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    const role = sessionUser?.user?.role;
    if (!role || !["admin", "assistant"].includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body || {};

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const updated = await ViewingAppointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment: updated }, { status: 200 });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ message: "Failed to update appointment" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params || {};
  const EDIT_WINDOW_HOURS = 12;
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    const userId = sessionUser?.userId;
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, date, note } = body || {};

    const existing = await ViewingAppointment.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }
    if (String(existing.userId) !== String(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = Date.now();
    const scheduledTs = new Date(existing.date).getTime();
    const cutoff = scheduledTs - EDIT_WINDOW_HOURS * 60 * 60 * 1000;
    if (now > cutoff) {
      return NextResponse.json(
        { message: "This appointment can no longer be modified." },
        { status: 400 }
      );
    }

    const update = {};
    if (name) update.name = name.trim();
    if (phone) update.phone = phone.trim();
    if (date) update.date = new Date(date);
    if (note !== undefined) update.note = String(note);

    const updated = await ViewingAppointment.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ appointment: updated }, { status: 200 });
  } catch (error) {
    console.error("Edit appointment error:", error);
    return NextResponse.json({ message: "Failed to edit appointment" }, { status: 500 });
  }
}
