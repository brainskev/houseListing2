import { useCallback, useState } from "react";
import useCacheFetch from "./useCacheFetch";

const useAppointments = () => {
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const url = `/api/appointments?sortBy=${sortBy}&order=${order}`;
  const { data, loading, error, refresh } = useCacheFetch(url, { cache: "no-store" }, 3000);
  const appointments = data?.appointments || [];

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
    loading,
    error,
    refresh,
    updateStatus,
    sortBy,
    order,
    setSortBy,
    setOrder,
  };
};

export default useAppointments;
