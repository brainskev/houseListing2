"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
// Spinner intentionally removed from view; background loading handled silently
import MessageCard from "@/components/messages/MessageCard";
import ConversationView from "@/components/messages/ConversationView";
import { useGlobalContext } from "@/context/GlobalContext";
import useMessages from "@/hooks/useMessages";
import useSentMessages from "@/hooks/useSentMessages";
import useEnquiries from "@/hooks/useEnquiries";

const tabs = ["Inbox", "Sent"];

const Messages = () => {
  const [activeTab, setActiveTab] = useState("Inbox");
  const [threadSeed, setThreadSeed] = useState(null);
  
  // Poll at 5s only when a thread is open; otherwise fetch once with no polling
  const pollTtl = threadSeed ? 5000 : null;
  const { messages: inbox, loading: inboxLoading, refresh: refreshInbox } = useMessages({ enabled: true, ttl: pollTtl });
  const { messages: sent, loading: sentLoading, refresh: refreshSent } = useSentMessages({ enabled: true, ttl: pollTtl });
  const { enquiries, loading: enquiriesLoading, refresh: refreshEnquiries } = useEnquiries();
  
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { unReadCount } = useGlobalContext();
  const pathname = usePathname();
  const isInDashboard = pathname?.startsWith("/dashboard");
  const myId = session?.user?.id;
  const isLoading = inboxLoading || sentLoading || enquiriesLoading;

  const onUpdated = () => {
    refreshInbox();
    refreshSent();
    refreshEnquiries();
  };

  const markThreadRead = useCallback(async (seed) => {
    if (!seed || !myId) return;
    const propertyId = seed?.property?._id || seed?.property || null;
    const counterpartId = seed?.sender?._id || seed?.sender || null;
    const unreadForMe = (inbox || []).filter((m) => {
      const rId = m?.recipient?._id || m?.recipient;
      const sId = m?.sender?._id || m?.sender;
      const pId = m?.property?._id || m?.property;
      const matchesCounterpart = counterpartId ? sId === counterpartId : true;
      const matchesProperty = propertyId ? pId === propertyId : true;
      return rId === myId && !m?.read && matchesCounterpart && matchesProperty;
    });
    if (!unreadForMe.length) return;
    try {
      await Promise.all(unreadForMe.map((m) => axios.put(`/api/messages/${m._id}`)));
      // Refresh inbox to reflect read state; unread count will sync via badge's next poll
      refreshInbox();
      refreshSent();
      refreshEnquiries();
    } catch (e) {
      console.error("Failed to mark thread as read", e);
    }
  }, [inbox, myId, refreshInbox, refreshSent, refreshEnquiries]);

  const mappedEnquiries = useMemo(() => {
    if (!enquiries?.length || !session?.user?.id) return [];
    const isStaff = ["admin", "assistant"].includes(session?.user?.role);
    return enquiries.map((e) => {
      const property = e.propertyId || null;
      if (isStaff) {
        return {
          _id: `enq_${e._id}`,
          _type: "enquiry",
          body: e.message,
          createdAt: e.createdAt,
          sender: { _id: e.userId, username: e.name },
          recipient: { _id: session.user.id, username: session.user.name },
          property,
        };
      }
      return {
        _id: `enq_${e._id}`,
        _type: "enquiry",
        body: e.message,
        createdAt: e.createdAt,
        sender: { _id: session.user.id, username: session.user.name },
        recipient: null,
        property,
      };
    });
  }, [enquiries, session?.user?.id, session?.user?.name, session?.user?.role]);

  const sentWithEnquiries = useMemo(() => {
    const isStaff = ["admin", "assistant"].includes(session?.user?.role);
    const merged = isStaff ? [...(sent || [])] : [...(sent || []), ...mappedEnquiries];
    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sent, mappedEnquiries, session?.user?.role]);

  // Sort chats: new > contacted > others, each by recency
  const statusOrder = { new: 0, contacted: 1, closed: 2 };
  function getStatus(m) {
    // Try to get status from enquiry or message
    return m.status || m.body?.status || m.message?.status || "";
  }
  function chatSort(a, b) {
    const sa = getStatus(a);
    const sb = getStatus(b);
    const oa = statusOrder[sa] ?? 99;
    const ob = statusOrder[sb] ?? 99;
    if (oa !== ob) return oa - ob;
    // If same status, sort by most recent
    return new Date(b.createdAt) - new Date(a.createdAt);
  }
  const list = (activeTab === "Inbox" ? inbox : sentWithEnquiries).slice().sort(chatSort);

  // Deduplicate chats by property + counterparty to avoid duplicate rows for the same thread
  const dedupedList = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const m of list) {
      const propId = m?.property?._id || m?.property || "none";
      const senderId = m?.sender?._id || m?.sender;
      const recipientId = m?.recipient?._id || m?.recipient;
      const counterpartyId = senderId === myId ? recipientId : senderId;
      const key = `${propId}-${counterpartyId || "unknown"}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(m);
    }
    return result;
  }, [list, myId]);

  // If navigated with an enquiryId, open that thread seeded from mapped enquiries
  useEffect(() => {
    const enqId = searchParams?.get("enquiryId");
    const recipientId = searchParams?.get("recipientId");
    const recipientName = searchParams?.get("recipientName");
    const propertyId = searchParams?.get("propertyId");
    if (!enqId && !recipientId) return;

    // Try to find mapped enquiry first
    const seed = enqId
      ? mappedEnquiries.find((e) => e._id === `enq_${enqId}` || e._id === enqId)
      : null;

    if (seed) {
      setThreadSeed(seed);
      markThreadRead(seed);
      return;
    }

    // Fallback: create a minimal seed so admin/assistant can start a chat immediately
    if (recipientId) {
      setThreadSeed({
        _id: `enq_link_${enqId || recipientId}`,
        _type: "enquiry",
        body: "",
        createdAt: new Date().toISOString(),
        sender: { _id: recipientId, username: recipientName || "User" },
        recipient: session?.user ? { _id: session.user.id, username: session.user.name } : null,
        property: propertyId || null,
      });
      markThreadRead({
        sender: { _id: recipientId },
        property: propertyId,
      });
    }
  }, [searchParams, mappedEnquiries, session?.user, markThreadRead]);

  const handleOpenThread = async (m) => {
    await markThreadRead(m);
    setThreadSeed(m);
  };

  // Render differently depending on dashboard context to avoid double wrappers
  if (isInDashboard) {
    return (
      <div>
        {!threadSeed && (
          <div className="mb-4 flex rounded-xl bg-blue-50 p-1 text-sm">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-lg px-3 py-1 font-medium ${
                  activeTab === t ? "bg-white text-blue-700 shadow-sm" : "text-blue-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {threadSeed ? (
          <ConversationView
            seedMessage={threadSeed}
            inbox={inbox}
            sent={sent}
            onUpdated={onUpdated}
            onBack={() => setThreadSeed(null)}
          />
        ) : (
          <div className="mt-2 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
            {dedupedList?.length === 0 ? (
              <p className="text-sm text-slate-600">No messages</p>
            ) : (
              dedupedList.map((m) => (
                <MessageCard
                  key={m._id}
                  m={m}
                  context={activeTab === "Inbox" ? "inbox" : "sent"}
                  onUpdated={onUpdated}
                  onOpenThread={handleOpenThread}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-blue-100 p-4 lg:p-6">
          {!threadSeed && (
            <div className="mb-4 flex rounded-xl bg-blue-50 p-1 text-sm">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`rounded-lg px-3 py-1 font-medium ${
                    activeTab === t ? "bg-white text-blue-700 shadow-sm" : "text-blue-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          {threadSeed ? (
            <ConversationView
              seedMessage={threadSeed}
              inbox={inbox}
              sent={sent}
              onUpdated={onUpdated}
              onBack={() => setThreadSeed(null)}
            />
          ) : (
            <div className="mt-2 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              {dedupedList?.length === 0 ? (
                <p className="text-sm text-slate-600">No messages</p>
              ) : (
                dedupedList.map((m) => (
                  <MessageCard
                    key={m._id}
                    m={m}
                    context={activeTab === "Inbox" ? "inbox" : "sent"}
                    onUpdated={onUpdated}
                    onOpenThread={handleOpenThread}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Messages;
