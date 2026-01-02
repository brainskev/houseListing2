"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AssistantSettingsPage() {
  const { data: session } = useSession();
  return (
    <DashboardLayout role="assistant" title="Settings" session={session}>
      <p className="text-slate-600 text-sm">Settings coming soon.</p>
    </DashboardLayout>
  );
}
