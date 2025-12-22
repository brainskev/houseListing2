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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real Estate Insights</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug}`} className="group block rounded-lg overflow-hidden border border-gray-200 hover:shadow bg-white">
            {post.featuredImage?.url ? (
              <div className="w-full aspect-video">
                <Image src={post.featuredImage.url} alt={post.title} width={800} height={450} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100" />
            )}
            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold group-hover:text-brand-600 line-clamp-2">{post.title}</h3>
              <p className="mt-1 text-[11px] sm:text-xs text-gray-500">{post.author?.name || post.author?.username} • {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/blog?page=${p}`}
            className={`px-2 sm:px-3 py-1 rounded ${p === page ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
