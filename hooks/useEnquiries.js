import { useCallback } from "react";
import useCacheFetch from "./useCacheFetch";

const useEnquiries = () => {
  const { data, loading, error, refresh } = useCacheFetch("/api/enquiries", { cache: "no-store" }, 3000);
  const enquiries = data?.enquiries || [];

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

  return { enquiries, loading, error, refresh, updateStatus };
};

export default useEnquiries;
