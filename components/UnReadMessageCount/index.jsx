
"use client";
import React from "react";
import { useGlobalContext } from "@/context/GlobalContext";

const UnreadMessageCount = () => {
  const { unreadMessagesCount } = useGlobalContext();

  if (!unreadMessagesCount) return null;

  return (
    <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white shadow-lg">
      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
    </span>
  );
};

export default UnreadMessageCount;
