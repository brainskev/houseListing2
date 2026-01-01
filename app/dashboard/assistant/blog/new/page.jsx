\"use client\";

import { useSession } from \"next-auth/react\";
import BlogEditor from \"@/components/blog/BlogEditor\";
import DashboardLayout from \"@/components/dashboard/DashboardLayout\";

export default function NewAssistantBlogPostPage() {
  const { data: session } = useSession();
  return (
    <DashboardLayout role=\"assistant\" title=\"New Blog Post\" session={session}>
      <BlogEditor isAdmin={false} />
    </DashboardLayout>
  );
}
