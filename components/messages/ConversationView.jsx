"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import useEnquiryThread from "@/hooks/useEnquiryThread";
import MessageComposer from "./MessageComposer";

export default function ConversationView({ enquiryId, onBack }) {
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const { enquiry, messages, loading, sending, sendMessage, markRead } = useEnquiryThread(enquiryId);
  const containerRef = useRef(null);

  const roomLabel = enquiry?.propertyId?.name || "Conversation";
  const locationLabel = enquiry?.propertyId?.location?.city && enquiry?.propertyId?.location?.state
    ? `${enquiry.propertyId.location.city}, ${enquiry.propertyId.location.state}`
    : "";

  const ordered = useMemo(() => {
    return [...(messages || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [ordered]);

  useEffect(() => {
    if (!enquiryId) return;
    // Mark read on open; server resets this user's unread counter and emits chat:read.
    markRead();
  }, [enquiryId, markRead]);

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">{roomLabel}</h2>
          {locationLabel && <p className="text-xs text-slate-700">{locationLabel}</p>}
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
        >
          Back
        </button>
      </div>

      <div ref={containerRef} className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {ordered.map((m) => {
          const senderId = m?.senderId?._id || m?.senderId || m?.sender?._id;
          const isMine = myId && senderId ? senderId === myId : false;
          const senderName = m?.senderId?.username || m?.senderId?.name || m?.sender?.username || m?.sender?.name || "Unknown";
          return (
            <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="flex max-w-[75%] flex-col gap-1">
                {!isMine && (
                  <span className="px-2 text-xs font-medium text-slate-600">{senderName}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 text-sm shadow-soft ${
                    isMine ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900 ring-1 ring-brand-100"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[11px] ${isMine ? "text-white/80" : "text-brand-700"}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && ordered.length === 0 && (
          <p className="text-sm text-slate-600">No messages yet. Start the conversation below.</p>
        )}
      </div>

      <div className="border-t border-blue-100 pt-3">
        <MessageComposer onSend={sendMessage} sending={sending} />
      </div>
    </div>
  );
}
