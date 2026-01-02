"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import useEnquiries from "@/hooks/useEnquiries";
import ConversationView from "@/components/messages/ConversationView";

const Messages = () => {
  const [activeEnquiryId, setActiveEnquiryId] = useState(null);
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const { enquiries, loading } = useEnquiries({ enabled: isAuthed, pollMs: 15000 });
  const pathname = usePathname();
  const myId = session?.user?.id;
  const isInDashboard = pathname?.startsWith("/dashboard");

  const renderList = () => (
    <div className="space-y-3">
      {enquiries.length === 0 && !loading && <p className="text-sm text-slate-600">No chats yet.</p>}
      {enquiries.map((e) => {
        const unread = e?.unreadCountByUser || {};
        const myUnread = myId ? (typeof unread.get === "function" ? unread.get(myId) : unread[myId]) : 0;
        return (
          <button
            key={e._id}
            onClick={() => setActiveEnquiryId(e._id)}
            className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-soft hover:border-blue-200"
          >
            <div>
              <p className="text-sm font-semibold text-blue-900">{e.propertyId?.name || "Property Chat"}</p>
              <p className="text-xs text-slate-600">{e.contactName || "You"}</p>
              {e.lastMessageText && <p className="mt-1 line-clamp-1 text-xs text-slate-700">{e.lastMessageText}</p>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-slate-500">{new Date(e.lastMessageAt || e.createdAt).toLocaleString()}</span>
              {myUnread ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">{myUnread}</span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );

  const content = activeEnquiryId ? (
    <ConversationView enquiryId={activeEnquiryId} onBack={() => setActiveEnquiryId(null)} />
  ) : (
    renderList()
  );

  if (isInDashboard) {
    return <div>{content}</div>;
  }

  return (
    <section className="bg-blue-50">
      <div className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-blue-100 p-4 lg:p-6">
          {content}
        </div>
      </div>
    </section>
  );
};

export default Messages;
