import connectDB from "@/config/db";
import BlogPost from "@/models/BlogPost";
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";
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

function slugify(str) {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

async function ensureUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const exists = await BlogPost.findOne({ slug });
        if (!exists) return slug;
        slug = `${baseSlug}-${suffix++}`;
    }
}

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
        const status = searchParams.get("status") || "published";
        const q = searchParams.get("q") || "";

        let role = "user";
        const sessionRes = await getSessionUser();
        if (sessionRes && !(sessionRes instanceof Response)) {
            role = sessionRes.user?.role || "user";
        }

        const query = {};
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { content: { $regex: q, $options: "i" } },
            ];
        }

        if (role === "admin") {
            if (status !== "all") query.status = status;
        } else if (role === "assistant") {
            if (status === "draft" || status === "published") {
                query.status = status;
            } else {
                query.status = "published";
            }
        } else {
            query.status = "published";
        }

        const total = await BlogPost.countDocuments(query);
        const posts = await BlogPost.find(query)
            .populate({ path: "author", select: "name username image role" })
            .sort(query.status === "published" ? { publishedAt: -1 } : { updatedAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        return new Response(
            JSON.stringify({ total, posts }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("GET /api/blog error", error);
        return new Response("Server error", { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const sessionRes = await getSessionUser();
        if (!sessionRes || sessionRes instanceof Response) {
            return new Response("Unauthorized", { status: 401 });
        }
        const { userId, user } = sessionRes;
        const role = user?.role || "user";
        if (!(role === "admin" || role === "assistant")) {
            return new Response("Forbidden", { status: 403 });
        }

        let data;
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            const title = String(form.get("title") || "").trim();
            const rawSlug = String(form.get("slug") || "").trim();
            const contentRaw = String(form.get("content") || "").trim();
            const statusInput = String(form.get("status") || "draft");

            if (!title || !contentRaw) {
                return new Response("Title and content are required", { status: 400 });
            }

            const baseSlug = slugify(rawSlug || title);
            const uniqueSlug = await ensureUniqueSlug(baseSlug);
            const content = sanitizeHtml(contentRaw, sanitizeOptions);

            // Images
            let featuredImage = null;
            const featured = form.get("featuredImage");
            if (featured && typeof featured === "object") {
                const arrayBuffer = await featured.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadRes = await new Promise((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream({ folder: "blog" }, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        })
                        .end(buffer);
                });
                featuredImage = { url: uploadRes.secure_url, publicId: uploadRes.public_id };
            }

            const gallery = [];
            const galleryFiles = form.getAll("gallery");
            for (const file of galleryFiles) {
                if (file && typeof file === "object") {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uploadRes = await new Promise((resolve, reject) => {
                        cloudinary.uploader
                            .upload_stream({ folder: "blog" }, (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            })
                            .end(buffer);
                    });
                    gallery.push({ url: uploadRes.secure_url, publicId: uploadRes.public_id });
                }
            }

            // Assistants cannot publish directly
            const status = role === "assistant" ? "draft" : statusInput === "published" ? "published" : "draft";
            if (status === "published" && !featuredImage) {
                return new Response("Featured image required to publish", { status: 400 });
            }

            data = { title, slug: uniqueSlug, content, featuredImage, gallery, author: userId, status };
        } else {
            const body = await request.json();
            const title = String(body.title || "").trim();
            const rawSlug = String(body.slug || "").trim();
            const contentRaw = String(body.content || "").trim();
            const statusInput = String(body.status || "draft");

            if (!title || !contentRaw) {
                return new Response("Title and content are required", { status: 400 });
            }

            const baseSlug = slugify(rawSlug || title);
            const uniqueSlug = await ensureUniqueSlug(baseSlug);
            const content = sanitizeHtml(contentRaw, sanitizeOptions);

            const status = role === "assistant" ? "draft" : statusInput === "published" ? "published" : "draft";

            data = { title, slug: uniqueSlug, content, author: userId, status };
        }

        const post = await BlogPost.create(data);
        return new Response(JSON.stringify(post), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("POST /api/blog error", error);
        return new Response(error.message || "Server error", { status: 500 });
    }
}
