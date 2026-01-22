"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentTable from "@/components/dashboard/AppointmentTable";
import useAppointments from "@/hooks/useAppointments";

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();

  // Simplified hook — no polling, just fetch once
  const {
    appointments,
    loading,
    error,
    updateStatus,
    sortBy,
    order,
    setSortBy,
    setOrder,
    fetchAppointments // manual refresh if needed
  } = useAppointments({ enabled: true });

  return (
    <DashboardLayout role="admin" title="Viewing Appointments" countsEnabled={false} session={session}>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {/* Sorting controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Sort by</label>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="user">User</option>
              <option value="property">Property</option>
            </select>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Appointment Table */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <AppointmentTable appointments={appointments} onStatusChange={updateStatus} />
        ) : (
          <p className="text-sm text-slate-500">No appointments found</p>
        )}
      </div>
    </DashboardLayout>
  );
}
