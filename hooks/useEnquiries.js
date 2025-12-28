import { useCallback, useEffect, useState } from "react";

const useEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiries", { cache: "no-store" });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load enquiries");
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

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
      const updated = (await res.json())?.enquiry;
      setEnquiries((prev) => prev.map((item) => (item._id === id ? updated : item)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  return { enquiries, loading, error, refresh: fetchEnquiries, updateStatus };
};

export default useEnquiries;
