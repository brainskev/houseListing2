import { useCallback, useEffect, useState } from "react";

const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // date | user | property
  const [order, setOrder] = useState("desc"); // asc | desc

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sortBy, order });
      const res = await fetch(`/api/appointments?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load appointments");
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, order]);

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
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to update status");
      }
      const updated = (await res.json())?.appointment;
      setAppointments((prev) => prev.map((item) => (item._id === id ? updated : item)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    refresh: fetchAppointments,
    updateStatus,
    sortBy,
    order,
    setSortBy,
    setOrder,
  };
};

export default useAppointments;
