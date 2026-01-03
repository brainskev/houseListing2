"use client";
import React, { useState } from "react";

export default function MessageComposer({ onSend, sending }) {
  const [body, setBody] = useState("");
  const disabled = sending || !body.trim();

  const handleSend = async () => {
    if (!body.trim()) return;
    await onSend?.(body.trim());
    setBody("");
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-soft backdrop-blur-sm">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Write a reply…"
        className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={handleSend}
          disabled={disabled}
          className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-base font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send Reply"}
        </button>
      </div>
    </div>
  );
}