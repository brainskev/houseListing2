"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EnquiryReplyModal from "./EnquiryReplyModal";

const statusColors = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-brand-100 text-brand-800",
  closed: "bg-emerald-100 text-emerald-800",
};

const EnquiryTable = ({ enquiries = [], onStatusChange, disableActions = false, onReplied, userMode = false, onOpenMessage }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const router = useRouter();

  const openReply = (enquiry) => {
    setActiveEnquiry(enquiry);
    setReplyOpen(true);
  };
  const closeReply = () => {
    setReplyOpen(false);
    setActiveEnquiry(null);
  };
  const adminCols = disableActions ? 6 : 7;
  const userCols = 5;
  // Sort: new > contacted > closed, each by most recent created date
  const statusOrder = { new: 0, contacted: 1, closed: 2 };
  function getStatus(a) { return a.status || ""; }
  function sortEnquiries(a, b) {
    const oa = statusOrder[getStatus(a)] ?? 99;
    const ob = statusOrder[getStatus(b)] ?? 99;
    if (oa !== ob) return oa - ob;
    // If same status, sort by most recent created date
    return new Date(b.createdAt) - new Date(a.createdAt);
  }
  const sortedEnquiries = enquiries.slice().sort(sortEnquiries);
  return (
    <div className="space-y-4">
      {/* Desktop/table view */}
      <div className="hidden md:block max-h-[70vh] overflow-auto">
        <div className="overflow-x-auto rounded-lg border border-blue-100">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-blue-50 text-left text-sm font-semibold text-blue-700">
            <tr>
              {userMode ? (
                <>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Enquiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  {!disableActions && <th className="px-4 py-3 text-right">Actions</th>}
                </>
              )}
            </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white text-sm text-slate-900">
            {sortedEnquiries.length === 0 && (
              <tr>
                <td colSpan={userMode ? userCols : adminCols} className="px-4 py-6 text-center text-slate-600">
                  No enquiries yet.
                </td>
              </tr>
            )}
            {sortedEnquiries.map((enquiry) => (
              <tr key={enquiry._id} className="hover:bg-blue-50/50">
                {userMode ? (
                  <>
                    <td className="px-4 py-3">
                      {enquiry?.propertyId ? (
                        <a
                          href={`/properties/${enquiry.propertyId._id || enquiry.propertyId}`}
                          className="text-blue-700 hover:underline"
                        >
                          {enquiry.propertyId.name || "View Property"}
                        </a>
                      ) : (
                        <span className="text-blue-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="line-clamp-2">
                        {enquiry.message?.length > 140 ? `${enquiry.message.slice(0, 140)}…` : enquiry.message}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                        onClick={() => onOpenMessage?.(enquiry)}
                      >
                        Message Admin
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-slate-900">{enquiry.name}</td>
                    <td className="px-4 py-3">{enquiry.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{enquiry.message}</td>
                    <td className="px-4 py-3">
                      {enquiry?.propertyId ? (
                        <a
                          href={`/properties/${enquiry.propertyId._id || enquiry.propertyId}`}
                          className="text-blue-700 hover:underline"
                        >
                          {enquiry.propertyId.name || "View Property"}
                        </a>
                      ) : (
                        <span className="text-blue-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    {!disableActions && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                            onClick={() => openReply(enquiry)}
                          >
                            Reply
                          </button>
                          <button
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                            onClick={() => {
                              const pid = enquiry?.propertyId?._id || enquiry?.propertyId;
                              const params = new URLSearchParams({ enquiryId: enquiry._id });
                              if (pid) params.set("propertyId", pid);
                              router.push(`/messages?${params.toString()}`);
                            }}
                          >
                            Open Chat
                          </button>
                          <select
                            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                            value={enquiry.status}
                            onChange={(e) => onStatusChange(enquiry._id, e.target.value)}
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="closed">closed</option>
                          </select>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/card view */}
      <div className="md:hidden max-h-[70vh] overflow-auto space-y-3">
        {enquiries.length === 0 ? (
          <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-slate-600">No enquiries yet.</div>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry._id} className="rounded-lg border border-blue-100 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {userMode ? (
                      enquiry?.propertyId ? (
                        <a href={`/properties/${enquiry.propertyId._id || enquiry.propertyId}`} className="text-blue-700 hover:underline">
                          {enquiry.propertyId.name || "View Property"}
                        </a>
                      ) : (
                        <span className="text-blue-400">—</span>
                      )
                    ) : (
                      enquiry.name
                    )}
                  </div>
                  {!userMode && <div className="text-xs text-slate-700">{enquiry.phone}</div>}
                  <div className="text-sm text-slate-700">{enquiry.message}</div>
                  <div className="text-xs text-slate-600">{new Date(enquiry.createdAt).toLocaleString()}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                  {enquiry.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {userMode ? (
                  <button
                    className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                    onClick={() => onOpenMessage?.(enquiry)}
                  >
                    Message Admin
                  </button>
                ) : (
                  <>
                    {!disableActions && (
                      <button
                        className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                        onClick={() => openReply(enquiry)}
                      >
                        Reply
                      </button>
                    )}
                    <button
                      className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-blue-50"
                      onClick={() => {
                        const pid = enquiry?.propertyId?._id || enquiry?.propertyId;
                        const params = new URLSearchParams({ enquiryId: enquiry._id });
                        if (pid) params.set("propertyId", pid);
                        router.push(`/messages?${params.toString()}`);
                      }}
                    >
                      Open Chat
                    </button>
                    {!disableActions && (
                      <select
                        className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                        value={enquiry.status}
                        onChange={(e) => onStatusChange(enquiry._id, e.target.value)}
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="closed">closed</option>
                      </select>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <EnquiryReplyModal
        open={replyOpen}
        onClose={closeReply}
        enquiry={activeEnquiry}
        onReplied={() => {
          if (activeEnquiry?._id) {
            onStatusChange?.(activeEnquiry._id, "contacted");
          }
        }}
      />
    </div>
  );
};

export default EnquiryTable;
