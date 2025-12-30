"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Messages from "@/components/Messages";

export default function UserMessagesPage() {
  return (
    <DashboardLayout role="user" title="Messages">
      <Messages />
    </DashboardLayout>
  );
}
