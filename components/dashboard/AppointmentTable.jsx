"use client";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-100 text-brand-800",
  completed: "bg-emerald-100 text-emerald-800",
};

const AppointmentTable = ({ appointments = [], onStatusChange, disableActions = false }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Property ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              {!disableActions && <th className="px-4 py-3 text-right">Update</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
            {appointments.length === 0 && (
              <tr>
                <td colSpan={disableActions ? 6 : 7} className="px-4 py-6 text-center text-slate-400">
                  No appointments yet.
                </td>
              </tr>
            )}
            {appointments.map((appointment) => (
              <tr key={appointment._id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{appointment.name}</td>
                <td className="px-4 py-3">{appointment.phone}</td>
                <td className="px-4 py-3 text-slate-600">{appointment.propertyId}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(appointment.date).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[appointment.status] || "bg-slate-100 text-slate-700"}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(appointment.createdAt).toLocaleString()}</td>
                {!disableActions && (
                  <td className="px-4 py-3 text-right">
                    <select
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
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
  );
};

export default AppointmentTable;
