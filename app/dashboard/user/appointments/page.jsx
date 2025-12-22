"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentTable from "@/components/dashboard/AppointmentTable";
import useAppointments from "@/hooks/useAppointments";

export default function UserAppointmentsPage() {
  const { appointments, loading, error } = useAppointments();

  return (
    <DashboardLayout role="user" title="My Viewing Appointments">
      {loading && <p className="text-sm text-slate-500">Loading appointments...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && (
        <AppointmentTable appointments={appointments} disableActions />
      )}
    </DashboardLayout>
  );
}
