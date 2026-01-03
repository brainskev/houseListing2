import connectDB from "@/config/db";
import Testimonial from "@/models/Testimonial";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// PATCH /api/testimonials/[id] - Update testimonial status (admin only)
export const PATCH = async (request, { params }) => {
    try {
        await connectDB();

        const sessionUser = await getSessionUser();
        if (sessionUser instanceof Response) return sessionUser;

        const role = sessionUser?.user?.role || "user";
        if (!["admin", "assistant"].includes(role)) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 403,
            });
        }

        const { id } = params;
        const { status } = await request.json();

        if (!["pending", "approved", "rejected"].includes(status)) {
            return new Response(JSON.stringify({ message: "Invalid status" }), {
                status: 400,
            });
        }

        const testimonial = await Testimonial.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!testimonial) {
            return new Response(JSON.stringify({ message: "Testimonial not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify(testimonial), {
            status: 200,
        });
    } catch (error) {
        console.error("Error updating testimonial:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};

// DELETE /api/testimonials/[id] - Delete testimonial (admin only)
export const DELETE = async (request, { params }) => {
    try {
        await connectDB();

        const sessionUser = await getSessionUser();
        if (sessionUser instanceof Response) return sessionUser;

        const role = sessionUser?.user?.role || "user";
        if (!["admin", "assistant"].includes(role)) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 403,
            });
        }

        const { id } = params;
        const testimonial = await Testimonial.findByIdAndDelete(id);

        if (!testimonial) {
            return new Response(JSON.stringify({ message: "Testimonial not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ message: "Testimonial deleted" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};
