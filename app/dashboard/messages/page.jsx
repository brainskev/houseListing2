import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Messages from "@/components/Messages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardMessagesPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "user";
  return (
    <DashboardLayout role={role} title="Messages">
      <Messages />
    </DashboardLayout>
  );
}
