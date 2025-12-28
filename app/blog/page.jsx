import { fetchBlogPosts } from "@/utils/requests";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogListingPage({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const pageSize = 9;
  const { total, posts } = await fetchBlogPosts({ page, pageSize, status: "published" });
  const totalPages = Math.ceil((total || 0) / pageSize) || 1;

  return (
    <div>
      {/* Elegant hero */}
      <section className="relative isolate bg-hero-mesh">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/80 to-white" />
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:pt-16 sm:pb-10">
          <div className="max-w-3xl">
            <p className="label">Blog</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Real Estate Insights</h1>
            <p className="mt-3 body-base text-slate-600">Stories, trends, and practical guides from our team—curated to help you navigate property decisions with confidence.</p>
          </div>
        </div>
      </section>

      {/* Grid of articles */}
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-soft hover:shadow-lift transition-shadow"
            >
              <div className="relative w-full aspect-[16/9] bg-slate-100">
                {post.featuredImage?.url ? (
                  <Image src={post.featuredImage.url} alt={post.title} width={800} height={450} className="w-full h-full object-cover" />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-900 group-hover:text-brand-600 line-clamp-2">{post.title}</h3>
                <div className="mt-2 flex items-center gap-2 text-[11px] sm:text-xs text-slate-600">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {post.author?.name || post.author?.username}
                  </span>
                  <span>•</span>
                  <span>{new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm transition ${
                p === page ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
