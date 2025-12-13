"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EnquiryTable from "@/components/dashboard/EnquiryTable";
import useEnquiries from "@/hooks/useEnquiries";

export default function AssistantEnquiriesPage() {
  const { enquiries, loading, error, updateStatus } = useEnquiries();

  return (
    <DashboardLayout role="assistant" title="Enquiries">
      {loading && <p className="text-sm text-slate-500">Loading enquiries...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && (
        <EnquiryTable enquiries={enquiries} onStatusChange={updateStatus} />
      )}
    </DashboardLayout>
  );
}
