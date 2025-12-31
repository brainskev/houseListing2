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
        <>
          <div className="mt-4">
            <AppointmentTable appointments={appointments} disableActions />
          </div>
          {appointments.length === 0 && (
            <div className="mt-8 flex flex-col items-center">
              <p className="mb-3 text-slate-600 text-sm">You haven&apos;t booked any viewing appointments yet. To get started, browse available properties and book a viewing.</p>
              <a
                href="/properties"
                className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                View Properties
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
