"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";

export default function EnquiryReplyModal({ open, onClose, enquiry, onReplied }) {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!session?.user || !enquiry?.userId) return;
    const payload = {
      name: session.user.name || "",
      email: session.user.email || "",
      phone: "",
      message: body,
      recipient: enquiry.userId,
      ...(enquiry.propertyId ? { property: enquiry.propertyId } : {}),
    };
    setSending(true);
    try {
      const res = await axios.post("/api/messages", payload);
      if (res.status >= 200 && res.status < 300) {
        toast.success(res?.data?.message || "Reply sent");
        onReplied?.();
        onClose?.();
        setBody("");
      } else {
        toast.error(res?.data?.message || "Failed to send reply");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-100">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Reply to {enquiry?.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Their message: {enquiry?.message}</p>
        </div>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            <FaPaperPlane className="mr-2" /> {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
