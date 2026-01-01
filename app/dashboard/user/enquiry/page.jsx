"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function UserEnquiryPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout role="user" title="Enquiries" session={session}>
      <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-slate-700">
        Enquiries are no longer available. Please use the viewing booking or contact forms on property pages.
      </div>
    </DashboardLayout>
  );
}
