import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import User from "@/models/User";
import Enquiry from "@/models/Enquiry";
import ViewingAppointment from "@/models/ViewingAppointment";
import Property from "@/models/Property";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;

    // Only admin can update users (assistants can view but not edit)
    if (sessionUser?.user?.role !== "admin") {
      return NextResponse.json({ message: "Only admins can modify users" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { role, status } = body;

    // Validate inputs
    const validRoles = ["admin", "assistant", "user"];
    const validStatuses = ["active", "blocked"];

    const updateData = {};
    if (role && validRoles.includes(role)) {
      updateData.role = role;
    }
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      "name email username role status createdAt image"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;

    // Only admin can delete users (assistants cannot delete)
    if (sessionUser?.user?.role !== "admin") {
      return NextResponse.json({ message: "Only admins can delete users" }, { status: 403 });
    }

    const { id } = params;

    // Prevent admin from deleting themselves
    if (id === sessionUser.userId) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user and associated data
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Clean up associated data
    await Promise.all([
      Enquiry.deleteMany({ userId: id }),
      ViewingAppointment.deleteMany({ userId: id }),
      Property.deleteMany({ owner: id }),
    ]);

    return NextResponse.json(
      { message: "User and associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
