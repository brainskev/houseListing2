import { useCallback, useEffect, useRef, useState } from "react";
import useCacheFetch from "./useCacheFetch";

const useAppointments = ({ enabled = true, poll = true, ttl = 120000 } = {}) => {
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [appointments, setAppointments] = useState([]);
  const lastUpdatedRef = useRef(null);

  useEffect(() => {
    lastUpdatedRef.current = null;
    setAppointments([]);
  }, [sortBy, order]);

  const params = new URLSearchParams({ sortBy, order });
  if (lastUpdatedRef.current) {
    params.set("updatedAfter", lastUpdatedRef.current);
  }
  const url = enabled ? `/api/appointments?${params.toString()}` : null;
  const effectiveTtl = poll ? ttl : null;
  // Use no-store to force fresh fetches and skip in-memory caching (dev HMR-safe)
  const { data, loading, error, refresh: hookRefresh } = useCacheFetch(url, { cache: "no-store" }, enabled ? effectiveTtl : null);

  useEffect(() => {
    if (!data?.appointments) return;
    setAppointments((prev) => {
      const map = new Map();
      const merged = [...prev, ...data.appointments];
      for (const appt of merged) {
        if (!appt?._id) continue;
        map.set(appt._id, appt);
      }
      const deduped = Array.from(map.values()).sort((a, b) => {
        const av = a?.[sortBy];
        const bv = b?.[sortBy];
        const aVal = av ? new Date(av).valueOf() : 0;
        const bVal = bv ? new Date(bv).valueOf() : 0;
        if (aVal === bVal) return 0;
        const result = aVal < bVal ? -1 : 1;
        return order === "asc" ? result : -result;
      });
      const newest = deduped.reduce((acc, appt) => {
        const candidate = appt?.updatedAt || appt?.createdAt;
        if (!candidate) return acc;
        return !acc || new Date(candidate) > new Date(acc) ? candidate : acc;
      }, lastUpdatedRef.current);
      if (newest) lastUpdatedRef.current = newest;
      return deduped;
    });
  }, [data, order, sortBy]);

  // Expose refresh that can be called from outside
  const refresh = useCallback(() => {
    hookRefresh();
  }, [hookRefresh]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
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
    appointments,
    loading: enabled ? loading : false,
    error: enabled ? error : null,
    refresh,
    updateStatus,
    sortBy,
    order,
    setSortBy,
    setOrder,
  };
};

export default useAppointments;
