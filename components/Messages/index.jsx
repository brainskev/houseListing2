"use client";

import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "../Spinner";
import MessageCard from "@/components/messages/MessageCard";
import ConversationView from "@/components/messages/ConversationView";

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

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
            {!threadSeed && (
              <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`rounded-lg px-3 py-1 font-medium ${
                      activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            <div className="mt-4 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              {list?.length === 0 ? (
                <p className="text-sm text-slate-500">No messages</p>
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
