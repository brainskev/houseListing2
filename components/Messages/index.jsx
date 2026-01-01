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
  
  // Poll at 5s when thread is open (for active chat), 15s when closed (to sync with counter)
  const pollTtl = threadSeed ? 5000 : 15000;
  const { messages: inbox, loading: inboxLoading, refresh: refreshInbox } = useMessages({ enabled: true, ttl: pollTtl });
  const { messages: sent, loading: sentLoading, refresh: refreshSent } = useSentMessages({ enabled: true, ttl: pollTtl });
  const { enquiries, loading: enquiriesLoading, refresh: refreshEnquiries } = useEnquiries();
  
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { unReadCount, setThreadOpen, setUnReadCount, setActiveThread } = useGlobalContext();
  const pathname = usePathname();
  const isInDashboard = pathname?.startsWith("/dashboard");
  const myId = session?.user?.id;
  const isLoading = inboxLoading || sentLoading || enquiriesLoading;

  const onUpdated = () => {
    refreshInbox();
    refreshSent();
    refreshEnquiries();
  };

  // Update global context when thread opens/closes
  useEffect(() => {
    setThreadOpen(!!threadSeed);
    if (threadSeed) {
      // Store active thread details
      const propertyId = threadSeed?.property?._id || threadSeed?.property || null;
      const senderId = threadSeed?.sender?._id || threadSeed?.sender || null;
      const recipientId = threadSeed?.recipient?._id || threadSeed?.recipient || null;
      const counterpartId = senderId === myId ? recipientId : senderId;
      setActiveThread({ propertyId, counterpartId });
    } else {
      setActiveThread(null);
    }
  }, [threadSeed, setThreadOpen, setActiveThread, myId]);

  // Clear active thread when component unmounts
  useEffect(() => {
    return () => {
      setThreadOpen(false);
      setActiveThread(null);
    };
  }, [setThreadOpen, setActiveThread]);

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
      // Refresh inbox to reflect read state
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

  // Sort chats by most recent first (newest on top)
  const list = (activeTab === "Inbox" ? inbox : sentWithEnquiries)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Deduplicate chats by property + counterparty, keeping only the most recent message from each thread
  const dedupedList = useMemo(() => {
    const threadMap = new Map(); // key: "propId-counterpartyId", value: most recent message
    
    for (const m of list) {
      const propId = m?.property?._id || m?.property || "none";
      const senderId = m?.sender?._id || m?.sender;
      const recipientId = m?.recipient?._id || m?.recipient;
      const counterpartyId = senderId === myId ? recipientId : senderId;
      const key = `${propId}-${counterpartyId || "unknown"}`;
      
      // Keep the message if we haven't seen this thread, or if this message is newer
      if (!threadMap.has(key) || new Date(m.createdAt) > new Date(threadMap.get(key).createdAt)) {
        threadMap.set(key, m);
      }
    }
    
    return Array.from(threadMap.values());
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
    // Set thread first so activeThread is established
    setThreadSeed(m);
    // Then mark messages as read (counter will update via polling with exclusion)
    await markThreadRead(m);
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
