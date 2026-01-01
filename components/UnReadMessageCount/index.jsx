
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useGlobalContext } from "@/context/GlobalContext";

const POLL_INTERVAL = 15000; // 15 seconds for faster message counter updates

const UnreadMessageCount = ({ session }) => {
  const { unReadCount, setUnReadCount, activeThread } = useGlobalContext();
  const intervalRef = useRef();
  const lastFetchRef = useRef(0);
  const visibilityListenerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadMessages = async () => {
      try {
        if (!session) return;
        const now = Date.now();
        // Only fetch if not recently fetched (debounce rapid calls)
        if (now - lastFetchRef.current < 500) return;
        lastFetchRef.current = now;

        // Build query params to exclude active thread messages
        const params = new URLSearchParams();
        if (activeThread?.propertyId) {
          params.append('excludeProperty', activeThread.propertyId);
        }
        if (activeThread?.counterpartId) {
          params.append('excludeCounterpart', activeThread.counterpartId);
        }
        const queryString = params.toString();
        const url = queryString ? `/api/messages/unread-count?${queryString}` : '/api/messages/unread-count';
        const response = await axios.get(url);
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
    
    // Force reset debounce on mount or session change to allow immediate fetch
    lastFetchRef.current = 0;
    
    // Immediate fetch when session/activeThread changes
    if (session) {
      fetchUnreadMessages();
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Always set up polling interval
    if (session) {
      intervalRef.current = setInterval(fetchUnreadMessages, POLL_INTERVAL);
    }
    
    // Handle page visibility changes (pull-to-refresh, page focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session) {
        // Reset debounce timer to allow immediate fetch
        lastFetchRef.current = 0;
        fetchUnreadMessages();
      }
    };
    
    if (visibilityListenerRef.current) {
      document.removeEventListener('visibilitychange', visibilityListenerRef.current);
    }
    visibilityListenerRef.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (visibilityListenerRef.current) {
        document.removeEventListener('visibilitychange', visibilityListenerRef.current);
      }
    };
  }, [session, setUnReadCount, activeThread]);

  return (
    unReadCount > 0 && (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        {unReadCount}
      </span>
    )
  );
};

export default UnreadMessageCount;
