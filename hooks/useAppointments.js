import { useState, useEffect, useCallback } from "react";

const useAppointments = ({ enabled = true } = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");

  const fetchAppointments = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ sortBy, order });
      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (!res.ok) throw new Error((await res.json())?.message || "Failed to fetch");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [enabled, sortBy, order]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json())?.message || "Failed to update status");
      fetchAppointments(); // refresh after update
      return true;
    } catch (err) {
      console.error("Failed to update status:", err);
      return false;
    }
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments, // can manually refresh
    updateStatus,
    sortBy,
    setSortBy,
    order,
    setOrder,
  };
};

export default useAppointments;
