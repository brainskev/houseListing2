"use client";

import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "../Spinner";
import MessageCard from "@/components/messages/MessageCard";
import ConversationView from "@/components/messages/ConversationView";
import { useGlobalContext } from "@/context/GlobalContext";

const tabs = ["Inbox", "Sent"];

const Messages = () => {
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Inbox");
  const [threadSeed, setThreadSeed] = useState(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { unReadCount } = useGlobalContext();
  const pathname = usePathname();
  const isInDashboard = pathname?.startsWith("/dashboard");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const calls = [axios.get("/api/messages"), axios.get("/api/messages/sent"), axios.get("/api/enquiries")];
      const results = await Promise.all(calls);
      const [inboxRes, sentRes, enquiriesRes] = results;
      if (inboxRes.status >= 200 && inboxRes.status < 300) setInbox(inboxRes.data || []);
      if (sentRes.status >= 200 && sentRes.status < 300) setSent(sentRes.data || []);
      if (enquiriesRes && enquiriesRes.status >= 200 && enquiriesRes.status < 300) {
        setEnquiries(enquiriesRes.data?.enquiries || []);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role]);

  const onUpdated = () => fetchAll();

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
          sender: e.userId,
          recipient: session.user.id,
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

  const list = activeTab === "Inbox" ? inbox : sentWithEnquiries;

  // If navigated with an enquiryId, open that thread seeded from mapped enquiries
  useEffect(() => {
    const enqId = searchParams?.get("enquiryId");
    if (!enqId) return;
    const seed = mappedEnquiries.find((e) => e._id === `enq_${enqId}`);
    if (seed) setThreadSeed(seed);
  }, [searchParams, mappedEnquiries]);

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
        {loading ? (
          <Spinner loading={true} />
        ) : threadSeed ? (
          <ConversationView
            seedMessage={threadSeed}
            inbox={inbox}
            sent={sent}
            onUpdated={onUpdated}
            onBack={() => setThreadSeed(null)}
          />
        ) : (
          <div className="mt-2 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
            {list?.length === 0 ? (
              <p className="text-sm text-slate-600">No messages</p>
            ) : (
              list.map((m) => (
                <MessageCard
                  key={m._id}
                  m={m}
                  context={activeTab === "Inbox" ? "inbox" : "sent"}
                  onUpdated={onUpdated}
                  onOpenThread={setThreadSeed}
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
          {loading ? (
            <Spinner loading={true} />
          ) : threadSeed ? (
            <ConversationView
              seedMessage={threadSeed}
              inbox={inbox}
              sent={sent}
              onUpdated={onUpdated}
              onBack={() => setThreadSeed(null)}
            />
          ) : (
            <div className="mt-2 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              {list?.length === 0 ? (
                <p className="text-sm text-slate-600">No messages</p>
              ) : (
                list.map((m) => (
                  <MessageCard
                    key={m._id}
                    m={m}
                    context={activeTab === "Inbox" ? "inbox" : "sent"}
                    onUpdated={onUpdated}
                    onOpenThread={setThreadSeed}
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
