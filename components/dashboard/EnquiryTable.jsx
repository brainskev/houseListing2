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
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
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
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  {!disableActions && <th className="px-4 py-3 text-right">Actions</th>}
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={userMode ? 5 : (disableActions ? 5 : 6)} className="px-4 py-6 text-center text-slate-400">
                  No enquiries yet.
                </td>
              </tr>
            )}
            {enquiries.map((enquiry) => (
              <tr key={enquiry._id} className="hover:bg-slate-50/50">
                {userMode ? (
                  <>
                    <td className="px-4 py-3">
                      {enquiry?.propertyId ? (
                        <a
                          href={`/properties/${enquiry.propertyId._id || enquiry.propertyId}`}
                          className="text-brand-700 hover:underline"
                        >
                          {enquiry.propertyId.name || "View Property"}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="line-clamp-2">
                        {enquiry.message?.length > 140 ? `${enquiry.message.slice(0, 140)}…` : enquiry.message}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
                            onClick={() => openReply(enquiry)}
                          >
                            Reply
                          </button>
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
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
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
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
