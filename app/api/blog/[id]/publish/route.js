import connectDB from "@/config/db";
import BlogPost from "@/models/BlogPost";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const sessionRes = await getSessionUser();
        if (!sessionRes || sessionRes instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }
        const role = sessionRes.user?.role || "user";

        const body = await request.json();
        const action = body.action === "unpublish" ? "draft" : "published";

        // Permission: Only admins can publish/unpublish
        if (role !== "admin") {
            return new Response("Forbidden", { status: 403 });
        }

        const post = await BlogPost.findById(id);
        if (!post) return new Response("Not found", { status: 404 });
        if (action === "published" && !post.featuredImage) {
            return new Response("Featured image required to publish", { status: 400 });
        }

        post.status = action;
        await post.save();

        return new Response(JSON.stringify(post), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("PUT /api/blog/[id]/publish error", error);
        return new Response("Server error", { status: 500 });
    }
}
