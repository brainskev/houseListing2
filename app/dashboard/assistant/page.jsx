"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EnquiryTable from "@/components/dashboard/EnquiryTable";
import useEnquiries from "@/hooks/useEnquiries";

export default function AssistantEnquiriesPage() {
  const { data: session } = useSession();
  const { enquiries, loading, error, updateStatus } = useEnquiries({ ttl: 15000 });

  return (
    <DashboardLayout role=\"assistant\" title=\"Enquiries\" session={session}>
      {loading && <p className="text-sm text-slate-500">Loading enquiries...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && (
        <EnquiryTable
          enquiries={enquiries}
          onStatusChange={updateStatus}
          onReplied={() => {
            // optionally refresh status or list
          }}
        />
      )}
    </DashboardLayout>
  );
}
