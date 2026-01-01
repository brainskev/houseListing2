
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useGlobalContext } from "@/context/GlobalContext";

const POLL_INTERVAL = 30000; // 30 seconds for the badge to be the source of truth

const UnreadMessageCount = ({ session }) => {
  const { unReadCount, setUnReadCount } = useGlobalContext();
  const intervalRef = useRef();
  const lastFetchRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadMessages = async () => {
      try {
        if (!session) return;
        const now = Date.now();
        // Only fetch if not recently fetched (debounce rapid calls)
        if (now - lastFetchRef.current < 1000) return;
        lastFetchRef.current = now;

        const response = await axios.get("/api/messages/unread-count");
        if (response.status >= 200 && response.status < 300) {
          const data = response?.data?.count;
          if (isMounted && typeof data === "number") {
            setUnReadCount(data);
          }
        }
      } catch (error) {
        // Silently handle errors to avoid console spam
      }
    };
    
    fetchUnreadMessages();
    if (session) {
      intervalRef.current = setInterval(fetchUnreadMessages, POLL_INTERVAL);
    }
    
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, setUnReadCount]);

  return (
    unReadCount > 0 && (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        {unReadCount}
      </span>
    )
  );
};

export default UnreadMessageCount;
