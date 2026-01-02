"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket/client";

// Enquiries list hook: relies on server-provided unread maps and real-time socket events.
const useEnquiries = ({ enabled = true, pollMs = 15000 } = {}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sorted = useMemo(() => {
    return [...enquiries].sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
  }, [enquiries]);

  const refresh = async () => {
    if (!enabled || !userId) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/enquiries");
      setEnquiries(res.data?.enquiries || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId]);

  // Background polling as a safety net for new conversations where no room is joined yet.
  useEffect(() => {
    if (!enabled || !userId || !pollMs || pollMs <= 0) return undefined;
    const id = setInterval(() => {
      refresh();
    }, pollMs);
    return () => clearInterval(id);
  }, [enabled, userId, pollMs, refresh]);

  useEffect(() => {
    if (!enabled || !userId) return;
    const socket = getSocket(userId);
    if (!socket) return;

    const joinAll = () => {
      enquiries.forEach((e) => {
        if (e?._id) socket.emit("chat:join", { enquiryId: e._id });
      });
    };

    // Join now and on reconnect so rooms stay subscribed.
    joinAll();
    socket.on("connect", joinAll);

    const handleNew = (payload) => {
      if (!payload?.enquiryId) return;
      setEnquiries((prev) => {
        const next = [...prev];
        const idx = next.findIndex((e) => e._id === payload.enquiryId);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            unreadCountByUser: payload.unreadCountByUser || next[idx].unreadCountByUser,
            lastMessageAt: payload.message?.createdAt || next[idx].lastMessageAt,
            lastMessageText: payload.message?.text || next[idx].lastMessageText,
          };
        }
        return next;
      });
    };

    const handleRead = (payload) => {
      if (!payload?.enquiryId) return;
      setEnquiries((prev) => {
        const next = [...prev];
        const idx = next.findIndex((e) => e._id === payload.enquiryId);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            unreadCountByUser: payload.unreadCountByUser || next[idx].unreadCountByUser,
          };
        }
        return next;
      });
    };

    socket.on("message:new", handleNew);
    socket.on("chat:read", handleRead);
    return () => {
      socket.off("connect", joinAll);
      socket.off("message:new", handleNew);
      socket.off("chat:read", handleRead);
    };
  }, [enabled, userId, enquiries]);

  return { enquiries: sorted, loading, error, refresh };
};

export default useEnquiries;
