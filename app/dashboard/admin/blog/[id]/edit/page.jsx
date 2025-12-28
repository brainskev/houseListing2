import BlogEditor from "@/components/blog/BlogEditor";
import connectDB from "@/config/db";
import BlogPost from "@/models/BlogPost";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const dynamic = "force-dynamic";

export default async function EditAdminBlogPostPage({ params }) {
  await connectDB();
  const post = await BlogPost.findById(params.id).lean();
  const serializable = post ? JSON.parse(JSON.stringify(post)) : null;

  return (
    <DashboardLayout role="admin" title="Edit Blog Post">
      <BlogEditor isAdmin={true} post={serializable} />
    </DashboardLayout>
  );
}
