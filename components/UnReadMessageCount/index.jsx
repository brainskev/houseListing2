
"use client";
import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import useEnquiries from "@/hooks/useEnquiries";

const UnreadMessageCount = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { enquiries } = useEnquiries({ enabled: !!userId, pollMs: 30000 });

  const totalUnread = useMemo(() => {
    if (!userId) return 0;
    return enquiries.reduce((acc, e) => {
      const counts = e?.unreadCountByUser || {};
      const val = typeof counts.get === "function" ? counts.get(userId) : counts[userId];
      return acc + (Number(val) || 0);
    }, 0);
  }, [enquiries, userId]);

  if (!totalUnread) return null;

  return (
    <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white shadow-lg">
      {totalUnread > 99 ? "99+" : totalUnread}
    </span>
  );
};

export default UnreadMessageCount;
