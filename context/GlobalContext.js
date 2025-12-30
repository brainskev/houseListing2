"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";
// Create a context
const GlobalContext = createContext();
//create a provider
export function GlobalProvider({ children }) {
  const [unReadCount, setUnReadCount] = useState(0);
  const { data: session } = useSession();
  const [bookmarkProcessed, setBookmarkProcessed] = useState(false);

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
  return (
    <GlobalContext.Provider value={{ unReadCount, setUnReadCount }}>
      {children}
    </GlobalContext.Provider>
  );
}
// create a custom hook to access context
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
