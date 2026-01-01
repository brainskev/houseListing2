"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useGlobalContext } from "@/context/GlobalContext";
import MessageComposer from "./MessageComposer";

export default function ConversationView({ seedMessage, inbox = [], sent = [], onUpdated, onBack }) {
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const containerRef = useRef(null);
  const markedAsReadRef = useRef(new Set()); // Track which messages we've already marked as read
  const { setUnReadCount } = useGlobalContext();
  const propertyId = seedMessage?.property?._id || seedMessage?.property;
  const senderId = seedMessage?.sender?._id || seedMessage?.sender;
  const recipientIdSeed = seedMessage?.recipient?._id || seedMessage?.recipient;
  const meIsRecipient = recipientIdSeed === myId;
  const meIsSender = senderId === myId;
  const counterpartyId = meIsSender ? recipientIdSeed : senderId;
  const counterparty = meIsRecipient ? seedMessage?.sender : seedMessage?.recipient;
  const [resolvedRecipientId, setResolvedRecipientId] = useState(
    counterpartyId && counterpartyId !== myId ? counterpartyId : null
  );
  const [propertyName, setPropertyName] = useState(seedMessage?.property?.name || "");

  const syntheticFromSeed = useMemo(() => {
    if (!seedMessage || seedMessage._type !== "enquiry") return [];
    // Use the actual sender and recipient from the enquiry
    return [
      {
        _id: seedMessage._id,
        body: seedMessage.body,
        createdAt: seedMessage.createdAt,
        sender: seedMessage.sender,
        recipient: seedMessage.recipient,
        property: propertyId,
      },
    ];
  }, [seedMessage, propertyId]);

  const thread = useMemo(() => {
    const all = [...(inbox || []), ...(sent || [])];
    const filtered = all
      .filter((m) => {
        const pId = m?.property?._id || m?.property;
        const sId = m?.sender?._id || m?.sender;
        const rId = m?.recipient?._id || m?.recipient;
        const targetId = resolvedRecipientId || counterpartyId;
        const involvesCounterpart = targetId ? (sId === targetId || rId === targetId) : true;
        const sameProperty = !propertyId || pId === propertyId;
        return involvesCounterpart && sameProperty;
      });
    const withSeed = [...filtered, ...syntheticFromSeed];
    return withSeed.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [inbox, sent, counterpartyId, resolvedRecipientId, propertyId, syntheticFromSeed]);

  useEffect(() => {
    // When opening conversation, update the seed message status from "new" to "seen"
    const updateSeedStatus = async () => {
      if (!seedMessage) return;
      
      try {
        // If it's an enquiry, update enquiry status
        if (seedMessage._type === "enquiry") {
          await axios.put(`/api/enquiries/${seedMessage._id}`, { status: "seen" });
        } else if (seedMessage._id) {
          // If it's a regular message, update message status to "seen" if it's "new"
          await axios.put(`/api/messages/${seedMessage._id}`, { status: "seen" });
        }
      } catch (e) {
        console.error("Failed to update conversation status to seen", e);
      }
    };
    
    updateSeedStatus();
  }, [seedMessage]);

  useEffect(() => {
    // auto-scroll to bottom for latest messages
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [thread]);

  useEffect(() => {
    // mark unread inbound messages as read when opening/viewing the thread
    // but only mark each message once to avoid redundant API calls
    const markSeen = async () => {
      const unreadForMe = thread.filter(
        (m) => !m._type && ((m?.recipient?._id || m?.recipient) === myId) && !m?.read && !markedAsReadRef.current.has(m._id)
      );
      if (unreadForMe.length === 0) return;
      try {
        await Promise.all(unreadForMe.map((m) => axios.put(`/api/messages/${m._id}`)));
        // Track that we've marked these messages as read
        unreadForMe.forEach((m) => markedAsReadRef.current.add(m._id));
        // Don't call onUpdated() here - let the badge's next poll update the count
      } catch (e) {
        console.error("Failed to mark messages as read", e);
      }
    };
    markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread, myId]);

  useEffect(() => {
    // If we don't know the counterpart but have a property, fetch owner and display name
    const resolveDetails = async () => {
      if (!propertyId) return;
      try {
        const res = await axios.get(`/api/properties/${propertyId}`);
        const ownerId = res?.data?.owner;
        if (!resolvedRecipientId && ownerId && ownerId !== myId) setResolvedRecipientId(ownerId);
        const name = res?.data?.name;
        if (name) setPropertyName(name);
      } catch (e) {
        console.error("Failed to resolve property details", e);
      }
    };
    // Only fetch if we are missing either property name or recipient
    if (!propertyName || !resolvedRecipientId) resolveDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, resolvedRecipientId, propertyName]);

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">{counterparty?.username || counterparty?.name || "Conversation"}</h2>
          {propertyName && (
            <p className="text-xs text-slate-700">{propertyName}</p>
          )}
        </div>
        <button
          onClick={onBack}
          className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
        >
          Back
        </button>
      </div>

      <div ref={containerRef} className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {thread.map((m) => {
          const isMine = (m?.sender?._id || m?.sender) === myId;
          return (
            <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-soft ${
                  isMine ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900 ring-1 ring-brand-100"
                }`}
              >
                <p>{m.body || m.message}</p>
                <p className={`mt-1 text-[11px] ${isMine ? "text-white/80" : "text-brand-700"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        {thread.length === 0 && (
          <p className="text-sm text-slate-600">No messages yet. Start the conversation below.</p>
        )}
      </div>

      <div className="border-t border-blue-100 pt-3">
        <MessageComposer
          propertyId={propertyId}
          recipientId={resolvedRecipientId}
          seedMessage={seedMessage}
          onSent={onUpdated}
        />
      </div>
    </div>
  );
}
