import { useCallback, useEffect, useRef, useState } from "react";
import useCacheFetch from "./useCacheFetch";

const useEnquiries = ({ enabled = true, ttl = 300000 } = {}) => {
  const [enquiries, setEnquiries] = useState([]);
  const lastUpdatedRef = useRef(null);

  const qs = lastUpdatedRef.current ? `?updatedAfter=${encodeURIComponent(lastUpdatedRef.current)}` : "";
  const url = enabled ? `/api/enquiries${qs}` : null;
  // 5-minute cadence by default; pauses when tab is inactive via useCacheFetch
  // Explicitly pass null for ttl when disabled to prevent any polling
  const { data, loading, error, refresh } = useCacheFetch(
    url,
    { cache: "no-store" },
    enabled ? ttl : null
  );

  useEffect(() => {
    if (!data?.enquiries) return;
    setEnquiries((prev) => {
      const map = new Map();
      const merged = [...prev, ...data.enquiries];
      for (const e of merged) {
        if (!e?._id) continue;
        map.set(e._id, e);
      }
      const deduped = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const newest = deduped.length ? deduped[0].updatedAt || deduped[0].createdAt : lastUpdatedRef.current;
      if (newest) lastUpdatedRef.current = newest;
      return deduped;
    });
  }, [data]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to update status");
      }
      refresh();
      return true;
    } catch (err) {
      return false;
    }
  }, [refresh]);

  return {
    enquiries,
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    refresh,
    updateStatus,
  };
};

export default useEnquiries;
