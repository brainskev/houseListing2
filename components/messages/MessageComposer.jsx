"use client";
import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export default function MessageComposer({ propertyId, recipientId, onSent }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const disabled = sending || !body.trim();
  const { data: session } = useSession();

  const send = async () => {
    if (!recipientId || !body.trim()) return;
    setSending(true);
    try {
      const payload = {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        message: body,
        recipient: recipientId,
        ...(propertyId ? { property: propertyId } : {}),
      };
      await axios.post("/api/messages", payload);
      setBody("");
      onSent?.();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to send reply";
      toast?.error?.(msg);
      console.error("Failed to send reply", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-soft backdrop-blur-sm">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Write a reply…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={send}
          disabled={disabled}
          className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send Reply"}
        </button>
      </div>
    </div>
  );
}