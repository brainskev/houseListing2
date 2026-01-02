import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// GET /api/newsletter/subscribers - Get newsletter subscribers with pagination (admin only)
export const GET = async (request) => {
    try {
        await connectDB();

        const sessionUser = await getSessionUser();

        // Check if sessionUser is a Response (error) or null
        if (!sessionUser || sessionUser instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Extract role from user object
        const role = sessionUser.user?.role;

        // Only admins can view newsletter subscribers
        if (role !== "admin") {
            return new Response("Forbidden - Admin access required", { status: 403 });
        }

        // Get pagination parameters from query string
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));

        const skip = (page - 1) * pageSize;

        // Get total count
        const total = await Newsletter.countDocuments();

        // Get paginated subscribers
        const subscribers = await Newsletter.find({}).sort({ createdAt: -1 }).skip(skip).limit(pageSize);

        return new Response(
            JSON.stringify({
                subscribers,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error fetching newsletter subscribers:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};
