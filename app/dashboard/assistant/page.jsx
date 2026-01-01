"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AssistantEnquiriesPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout role="assistant" title="Enquiries" session={session}>
      <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-slate-700">
        Enquiries have been removed while we rebuild messaging. Please use the contact or viewing request flows instead.
      </div>
    </DashboardLayout>
  );
}
