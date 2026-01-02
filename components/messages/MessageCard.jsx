"use client";
import React, { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import MessageComposer from "./MessageComposer";

export default function MessageCard({ m, context = "sent", onUpdated, onOpenThread }) {
  const [open, setOpen] = useState(false);
  const isRead = !!m.read;
  const property = m.property;
  const sender = m.sender;
  const recipient = m.recipient;
  const propertyId = property?._id || property;

  const toggleRead = async () => {
    // Backend removed: no-op for now
  };

  // For replies: favor the original sender for enquiries to avoid self-recipient when owner === current user.
  const senderId = sender?._id || sender;
  const recipientIdInit = m._type === "enquiry"
    ? senderId
    : (context === "inbox" ? senderId : (recipient?._id || recipient));
  const [recipientId, setRecipientId] = useState(recipientIdInit || null);

  useEffect(() => {
    // Backend removed: skip resolving property owner
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propertyId]);

  const previewText = (() => {
    const raw = m.body || m.message || "";
    const max = 160;
    if (raw.length <= max) return raw;
    return raw.slice(0, max).trimEnd() + "…";
  })();

  return (
    <div className="rounded-3xl border border-blue-200/70 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-blue-900">{property?.name || (m._type === 'enquiry' ? 'Enquiry' : 'Message')}</p>
            {m._type === 'enquiry' && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Enquiry</span>
            )}
          </div>
          {property?.location?.city && property?.location?.state && (
            <p className="text-sm text-slate-700">
              {property.location.city}, {property.location.state}
            </p>
          )}
          <p className="mt-2 text-sm text-slate-900 line-clamp-2 break-words">{previewText}</p>
          <p className="mt-2 text-xs text-slate-600">
            {context === "inbox" ? `From ${sender?.username ?? "User"}` : `To ${recipient?.username ?? "Owner"}`} • {new Date(m.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!m._type && <StatusBadge status={isRead ? "Contacted" : "New"} />} 
          {context === "inbox" && (
            <span className="text-xs text-slate-400">Read toggles disabled</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-blue-700"
        >
          {open ? "Close Reply" : "Reply"}
        </button>
        <button
          onClick={() => onOpenThread?.(m)}
          className="inline-flex items-center rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-blue-900 shadow-soft ring-1 ring-blue-200 transition hover:bg-blue-50"
        >
          Open Conversation
        </button>
        <a
          href={`/properties/${property?._id}`}
          className="text-xs text-blue-700 underline hover:text-blue-800"
        >
          View Property
        </a>
      </div>

      {open && propertyId && recipientId && (
        <MessageComposer
          propertyId={propertyId}
          recipientId={recipientId}
          onSent={onUpdated}
        />
      )}
      {open && m._type === 'enquiry' && !property?._id && (
        <p className="mt-2 text-xs text-blue-600">This enquiry isn&#39;t linked to a property. Replies will appear when staff responds.</p>
      )}
    </div>
  );
}