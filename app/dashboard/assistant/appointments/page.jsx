"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentTable from "@/components/dashboard/AppointmentTable";
import useAppointments from "@/hooks/useAppointments";

export default function AssistantAppointmentsPage() {
  const { appointments, loading, error, updateStatus } = useAppointments();

  return (
    <DashboardLayout role="assistant" title="Viewing Appointments">
      {loading && <p className="text-sm text-slate-500">Loading appointments...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && (
        <AppointmentTable appointments={appointments} onStatusChange={updateStatus} />
      )}
    </DashboardLayout>
  );
}
