import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// GET /api/newsletter/export - Export newsletter subscribers as CSV (admin only)
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

        // Only admins can export newsletter subscribers
        if (role !== "admin") {
            return new Response("Forbidden - Admin access required", { status: 403 });
        }

        const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });

        // Generate CSV content
        const csvHeader = "Email,Subscribed Date\n";
        const csvRows = subscribers
            .map((sub) => {
                const date = new Date(sub.createdAt).toLocaleDateString();
                return `${sub.email},${date}`;
            })
            .join("\n");

        const csv = csvHeader + csvRows;

        // Return CSV file
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting newsletter subscribers:", error);
        return new Response("Something went wrong", { status: 500 });
    }
};
