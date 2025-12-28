import connectDB from "@/config/db";
import BlogPost from "@/models/BlogPost";
import { getSessionUser } from "@/utils/getSessionUser";
import sanitizeHtml from "sanitize-html";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sanitizeOptions = {
    allowedTags: [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "a",
        "blockquote",
        "code",
        "pre",
        "img",
        "br",
    ],
    allowedAttributes: {
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
};

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = params;

        const sessionRes = await getSessionUser();
        if (!sessionRes || sessionRes instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }
        const role = sessionRes.user?.role || "user";

        const post = await BlogPost.findById(id).populate({ path: "author", select: "name username image role" });
        if (!post) return new Response("Not found", { status: 404 });

        if (role === "user") {
            return new Response("Forbidden", { status: 403 });
        }

        return new Response(JSON.stringify(post), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("GET /api/blog/[id] error", error);
        return new Response("Server error", { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const sessionRes = await getSessionUser();
        if (!sessionRes || sessionRes instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }
        const { userId, user } = sessionRes;
        const role = user?.role || "user";

        const body = await request.json();
        const updates = {};
        if (body.title) updates.title = String(body.title).trim();
        if (body.content) updates.content = sanitizeHtml(String(body.content), sanitizeOptions);
        if (body.slug) updates.slug = String(body.slug).toLowerCase().trim();
        if (Array.isArray(body.gallery)) updates.gallery = body.gallery;
        if (body.featuredImage) updates.featuredImage = body.featuredImage;

        const post = await BlogPost.findById(id);
        if (!post) return new Response("Not found", { status: 404 });

        if (role === "assistant" && String(post.author) !== String(userId)) {
            return new Response("Forbidden", { status: 403 });
        }

        Object.assign(post, updates);
        await post.save();

        return new Response(JSON.stringify(post), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("PUT /api/blog/[id] error", error);
        return new Response(error.message || "Server error", { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const sessionRes = await getSessionUser();
        if (!sessionRes || sessionRes instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }
        const role = sessionRes.user?.role || "user";
        if (role !== "admin") {
            return new Response("Forbidden", { status: 403 });
        }

        const post = await BlogPost.findById(id);
        if (!post) return new Response("Not found", { status: 404 });

        await BlogPost.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: "Deleted" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("DELETE /api/blog/[id] error", error);
        return new Response("Server error", { status: 500 });
    }
}
