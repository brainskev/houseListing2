import { fetchBlogPosts } from "@/utils/requests";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";
import BlogManager from "@/components/blog/BlogManager";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const dynamic = "force-dynamic";

export default async function AssistantBlogPage() {
  const session = await getServerSession(authOptions);
  const { posts } = await fetchBlogPosts({ page: 1, pageSize: 20, status: "draft" });

  return (
    <DashboardLayout role="assistant" title="Blog">
      <BlogManager initialPosts={posts} isAdmin={false} currentUserId={session?.user?.id} />
    </DashboardLayout>
  );
}
