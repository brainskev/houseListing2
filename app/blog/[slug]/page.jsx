import { fetchBlogPostBySlug } from "@/utils/requests";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const post = await fetchBlogPostBySlug(params.slug);
  if (!post) return { title: "Blog Post" };
  const title = `${post.title} | Real Estate Hub`;
  const description = `${post.title} - Read insights and updates from our team.`;
  const url = `${process.env.NEXT_PUBLIC_DOMAIN || ""}/blog/${post.slug}`;
  const image = post.featuredImage?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const post = await fetchBlogPostBySlug(params.slug);
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Post Not Found</h1>
        <p className="text-gray-600 mt-2">The article you’re looking for does not exist.</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: { "@type": "Person", name: post.author?.name || post.author?.username },
    datePublished: post.publishedAt || post.updatedAt,
    image: post.featuredImage?.url ? [post.featuredImage.url] : [],
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_DOMAIN || ""}/blog/${post.slug}`,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">{post.title}</h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">{post.author?.name || post.author?.username} • {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}</p>
      {post.featuredImage?.url ? (
        <Image src={post.featuredImage.url} alt={post.title} width={1200} height={800} className="w-full h-auto rounded mb-6 sm:mb-8" priority />
      ) : null}
      <div className="blog-content max-w-none break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
      {Array.isArray(post.gallery) && post.gallery.length > 0 ? (
        <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {post.gallery.map((img) => (
            <Image key={img.publicId} src={img.url} alt={post.title} width={600} height={400} className="w-full aspect-video object-cover rounded" />
          ))}
        </div>
      ) : null}
    </article>
  );
}
