"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
import { resetCache } from "@/hooks/useCacheFetch";
import { disconnectSocket } from "@/lib/socket/client";
import { getSocket } from "@/lib/socket/client";
// Create a context
const GlobalContext = createContext();
//create a provider
export function GlobalProvider({ children }) {
  const [unReadCount, setUnReadCount] = useState(0);
  const { data: session } = useSession();
  const [bookmarkProcessed, setBookmarkProcessed] = useState(false);
  const [dashboardSidebarOpen, setDashboardSidebarOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  useEffect(() => {
    // Fallback: if a bookmark param is present after login (e.g., Google), process it once
    if (!session || bookmarkProcessed) return;
    try {
      const url = new URL(typeof window !== "undefined" ? window.location.href : "", window.location.origin);
      const propertyId = url.searchParams.get("bookmark");
      if (propertyId) {
        axios
          .post("/api/bookmark", { propertyId })
          .then(() => {
            toast.success("Property saved to bookmarks");
          })
          .finally(() => {
            url.searchParams.delete("bookmark");
            if (typeof window !== "undefined") {
              window.history.replaceState({}, "", url.toString());
            }
            setBookmarkProcessed(true);
          });
      }
    } catch { }
  }, [session, bookmarkProcessed]);

  // Clear caches/sockets on auth change to avoid stale data across users
  useEffect(() => {
    resetCache();
    disconnectSocket();
    if (session?.user?.id) {
      // Pre-warm socket server and establish connection after auth
      fetch("/api/socket").catch(() => { });
      getSocket(session.user.id);
    }
  }, [session?.user?.id]);
  return (
    <GlobalContext.Provider value={{ unReadCount, setUnReadCount, dashboardSidebarOpen, setDashboardSidebarOpen, threadOpen, setThreadOpen, activeThread, setActiveThread }}>
      {children}
    </GlobalContext.Provider>
  );
}
// create a custom hook to access context
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
