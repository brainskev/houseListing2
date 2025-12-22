import BlogEditor from "@/components/blog/BlogEditor";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewAdminBlogPostPage() {
  return (
    <DashboardLayout role="admin" title="New Blog Post">
      <BlogEditor isAdmin={true} />
    </DashboardLayout>
  );
}
