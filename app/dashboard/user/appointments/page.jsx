"use client";

import AppointmentTable from "@/components/dashboard/AppointmentTable";
import useAppointments from "@/hooks/useAppointments";

export default function UserAppointmentsPage() {
  const { appointments, loading, error } = useAppointments();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">My Viewing Appointments</h1>
      {loading && <p className="mt-2 text-sm text-slate-500">Loading appointments...</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!loading && (
        <div className="mt-4">
          <AppointmentTable appointments={appointments} disableActions />
        </div>
      )}
    </div>
  );
}
