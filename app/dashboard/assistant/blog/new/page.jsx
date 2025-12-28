import BlogEditor from "@/components/blog/BlogEditor";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewAssistantBlogPostPage() {
  return (
    <DashboardLayout role="assistant" title="New Blog Post">
      <BlogEditor isAdmin={false} />
    </DashboardLayout>
  );
}
