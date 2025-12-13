import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import ViewingAppointment from "@/models/ViewingAppointment";

const allowedStatuses = ["pending", "confirmed", "completed"];

export async function POST(request) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    if (!sessionUser?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, propertyId, date } = body || {};

    if (!name || !phone || !propertyId || !date) {
      return NextResponse.json(
        { message: "Name, phone, propertyId, and date are required" },
        { status: 400 }
      );
    }

    const appointment = await ViewingAppointment.create({
      userId: sessionUser.userId,
      name: name.trim(),
      phone: phone.trim(),
      propertyId,
      date: new Date(date),
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ message: "Failed to create appointment" }, { status: 500 });
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

    const appointments = await ViewingAppointment.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}
