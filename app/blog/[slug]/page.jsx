import { fetchBlogPostBySlug } from "@/utils/requests";
import Image from "next/image";
import ShareArticleButton from "@/components/blog/ShareArticleButton";

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
        <h1 className="font-serif text-3xl font-semibold text-slate-900">Post Not Found</h1>
        <p className="text-slate-600 mt-2">The article you’re looking for does not exist.</p>
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
      <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2 sm:mb-4">{post.title}</h1>
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-700">
          {post.author?.name || post.author?.username}
        </span>
        <span>•</span>
        <span>{new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}</span>
        <span className="ml-auto" />
        <ShareArticleButton
          url={`${process.env.NEXT_PUBLIC_DOMAIN || ""}/blog/${post.slug}`}
          title={post.title}
          className="ml-auto"
        />
      </div>
      {post.featuredImage?.url ? (
        <Image src={post.featuredImage.url} alt={post.title} width={1200} height={800} className="w-full h-auto rounded-2xl shadow-soft mb-6 sm:mb-8" priority />
      ) : null}
      <div className="blog-content max-w-none break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
      {Array.isArray(post.gallery) && post.gallery.length > 0 ? (
        <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {post.gallery.map((img) => (
            <Image key={img.publicId} src={img.url} alt={post.title} width={600} height={400} className="w-full aspect-video object-cover rounded-2xl shadow-soft" />
          ))}
        </div>
      ) : null}
    </article>
  );
}
