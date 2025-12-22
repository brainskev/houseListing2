"use client";

const statusColors = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-brand-100 text-brand-800",
  closed: "bg-emerald-100 text-emerald-800",
};

const EnquiryTable = ({ enquiries = [], onStatusChange, disableActions = false }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              {!disableActions && <th className="px-4 py-3 text-right">Update</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={disableActions ? 5 : 6} className="px-4 py-6 text-center text-slate-400">
                  No enquiries yet.
                </td>
              </tr>
            )}
            {enquiries.map((enquiry) => (
              <tr key={enquiry._id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{enquiry.name}</td>
                <td className="px-4 py-3">{enquiry.phone}</td>
                <td className="px-4 py-3 text-slate-600">{enquiry.message}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                    {enquiry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(enquiry.createdAt).toLocaleString()}
                </td>
                {!disableActions && (
                  <td className="px-4 py-3 text-right">
                    <select
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
                      value={enquiry.status}
                      onChange={(e) => onStatusChange(enquiry._id, e.target.value)}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="closed">closed</option>
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

export default EnquiryTable;
