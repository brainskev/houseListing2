import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";
import BlogManager from "@/components/blog/BlogManager";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AssistantBlogPage() {
  const session = await getServerSession(authOptions);
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const sp = new URLSearchParams({ page: "1", pageSize: "20", status: "all", q: "" });
  const cookieHeader = cookies().toString();
  const res = await fetch(`${base}/api/blog?${sp.toString()}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  const data = res.ok ? await res.json() : { posts: [] };
  const { posts } = data;

  return (
    <DashboardLayout role="assistant" title="Blog" session={session}>
      <BlogManager initialPosts={posts} isAdmin={false} currentUserId={session?.user?.id} />
    </DashboardLayout>
  );
}
