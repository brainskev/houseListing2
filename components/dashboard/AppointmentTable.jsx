"use client";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-100 text-brand-800",
  completed: "bg-emerald-100 text-emerald-800",
};

const AppointmentTable = ({ appointments = [], onStatusChange, disableActions = false }) => {
  return (
    <div className="space-y-4">
      {/* Desktop/table view */}
      <div className="hidden md:block max-h-[70vh] overflow-auto">
        <div className="overflow-x-auto rounded-lg border border-blue-100">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-blue-50 text-left text-sm font-semibold text-blue-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              {!disableActions && <th className="px-4 py-3 text-right">Update</th>}
            </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white text-sm text-blue-900">
            {appointments.length === 0 && (
              <tr>
                <td colSpan={disableActions ? 6 : 7} className="px-4 py-6 text-center text-blue-600">
                  No appointments yet.
                </td>
              </tr>
            )}
            {appointments.map((appointment) => (
              <tr key={appointment._id} className="hover:bg-blue-50/50">
                <td className="px-4 py-3 font-medium text-blue-900">{appointment.name}</td>
                <td className="px-4 py-3">{appointment.phone}</td>
                <td className="px-4 py-3 text-slate-700">
                  {appointment?.propertyId?._id || appointment?.propertyId ? (
                    <a
                      href={`/properties/${appointment?.propertyId?._id || appointment?.propertyId}`}
                      className="text-blue-700 hover:underline"
                    >
                      {appointment?.propertyId?.name || "View Property"}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-blue-700">{new Date(appointment.date).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-blue-600">{new Date(appointment.createdAt).toLocaleString()}</td>
                {!disableActions && (
                  <td className="px-4 py-3 text-right">
                    <select
                      className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                      value={appointment.status}
                      onChange={(e) => onStatusChange(appointment._id, e.target.value)}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="completed">completed</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/card view */}
      <div className="md:hidden max-h-[70vh] overflow-auto space-y-3">
        {appointments.length === 0 ? (
          <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-blue-600">No appointments yet.</div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-lg border border-blue-100 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-blue-900">{appointment.name}</div>
                  <div className="text-xs text-slate-700">{appointment.phone}</div>
                  <div className="text-sm text-slate-700">
                    {appointment?.propertyId?._id || appointment?.propertyId ? (
                      <a href={`/properties/${appointment?.propertyId?._id || appointment?.propertyId}`} className="text-blue-700 hover:underline">
                        {appointment?.propertyId?.name || "View Property"}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-700">{new Date(appointment.date).toLocaleString()}</div>
                  <div className="text-xs text-blue-600">{new Date(appointment.createdAt).toLocaleString()}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                  {appointment.status}
                </span>
              </div>
              {!disableActions && (
                <div className="mt-3">
                  <select
                    className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    value={appointment.status}
                    onChange={(e) => onStatusChange(appointment._id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                  </select>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentTable;
