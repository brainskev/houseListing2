"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Messages from "@/components/Messages";

export default function AdminMessagesPage() {
  return (
    <DashboardLayout role="admin" title="Messages">
      <Messages />
    </DashboardLayout>
  );
}
