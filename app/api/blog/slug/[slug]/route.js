import connectDB from "@/config/db";
import BlogPost from "@/models/BlogPost";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = params;

    let role = "user";
    const sessionRes = await getSessionUser();
    if (sessionRes && !(sessionRes instanceof Response)) {
      role = sessionRes.user?.role || "user";
    }

    const query = { slug };
    if (role === "user") {
      query.status = "published";
    }

    const post = await BlogPost.findOne(query).populate({ path: "author", select: "name username image role" });
    if (!post) return new Response("Not found", { status: 404 });

    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/blog/slug/[slug] error", error);
    return new Response("Server error", { status: 500 });
  }
}
