"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
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
    try {
      await axios.put(`/api/messages/${m._id}`);
      onUpdated?.();
    } catch (e) {
      console.error("Failed to toggle read", e);
    }
  };

  // For replies: if it's an inbox message, reply to sender; if it's a sent enquiry, reply to recipient.
  const senderId = sender?._id || sender;
  const recipientIdInit = context === "inbox" ? senderId : (recipient?._id || recipient);
  const [recipientId, setRecipientId] = useState(recipientIdInit || null);

  useEffect(() => {
    // When opening reply and we don't have a recipient yet but have a property, resolve owner
    const resolveRecipient = async () => {
      if (!open || recipientId || !propertyId) return;
      try {
        const res = await axios.get(`/api/properties/${propertyId}`);
        const ownerId = res?.data?.owner;
        if (ownerId) setRecipientId(ownerId);
      } catch (e) {
        console.error("Failed to resolve property owner for reply", e);
      }
    };
    resolveRecipient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propertyId]);

  const previewText = (() => {
    const raw = m.body || m.message || "";
    const max = 160;
    if (raw.length <= max) return raw;
    return raw.slice(0, max).trimEnd() + "…";
  })();

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{property?.name || (m._type === 'enquiry' ? 'Enquiry' : 'Message')}</p>
            {m._type === 'enquiry' && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Enquiry</span>
            )}
          </div>
          {property?.location?.city && property?.location?.state && (
            <p className="text-sm text-slate-600">
              {property.location.city}, {property.location.state}
            </p>
          )}
          <p className="mt-2 text-sm text-slate-700 line-clamp-2 break-words">{previewText}</p>
          <p className="mt-2 text-xs text-slate-500">
            {context === "inbox" ? `From ${sender?.username ?? "User"}` : `To ${recipient?.username ?? "Owner"}`} • {new Date(m.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!m._type && <StatusBadge status={isRead ? "Contacted" : "New"} />} 
          {context === "inbox" && (
            <button
              onClick={toggleRead}
              className="text-xs text-brand-700 underline hover:text-brand-800"
            >
              Mark as {isRead ? "Unread" : "Read"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-slate-800"
        >
          {open ? "Close Reply" : "Reply"}
        </button>
        <button
          onClick={() => onOpenThread?.(m)}
          className="inline-flex items-center rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Open Conversation
        </button>
        <a
          href={`/properties/${property?._id}`}
          className="text-xs text-slate-700 underline hover:text-brand-700"
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
        <p className="mt-2 text-xs text-slate-500">This enquiry isn't linked to a property. Replies will appear when staff responds.</p>
      )}
    </div>
  );
}