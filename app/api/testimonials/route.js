import connectDB from "@/config/db";
import Testimonial from "@/models/Testimonial";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// GET /api/testimonials - Get approved testimonials for public display
export const GET = async (request) => {
    try {
        await connectDB();

        const url = new URL(request.url);
        const status = url.searchParams.get("status");

        // If status is provided (for admin), check auth
        if (status) {
            const sessionUser = await getSessionUser();
            if (sessionUser instanceof Response) return sessionUser;

            const role = sessionUser?.user?.role || "user";
            if (!["admin", "assistant"].includes(role)) {
                return new Response(JSON.stringify({ message: "Unauthorized" }), {
                    status: 403,
                });
            }

            // Admin can filter by status
            const testimonials = await Testimonial.find({ status })
                .populate("userId", "name email")
                .populate("propertyId", "name")
                .sort({ createdAt: -1 });

            return new Response(JSON.stringify(testimonials), {
                status: 200,
            });
        }

        // Public route - only return approved testimonials
        const testimonials = await Testimonial.find({ status: "approved" })
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .limit(12);

        return new Response(JSON.stringify(testimonials), {
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};

// POST /api/testimonials - Submit a new testimonial
export const POST = async (request) => {
    try {
        await connectDB();

        const sessionUser = await getSessionUser();
        if (sessionUser instanceof Response) return sessionUser;

        if (!sessionUser || !sessionUser.userId) {
            return new Response(JSON.stringify({ message: "User ID is required" }), {
                status: 401,
            });
        }

        const { name, role, message, rating, propertyId } = await request.json();

        if (!message || !name) {
            return new Response(
                JSON.stringify({ message: "Name and message are required" }),
                { status: 400 }
            );
        }

        const testimonial = await Testimonial.create({
            userId: sessionUser.userId,
            name,
            role: role || "Customer",
            message,
            rating: rating || 5,
            propertyId: propertyId || null,
            status: "pending",
        });

        return new Response(JSON.stringify(testimonial), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};
