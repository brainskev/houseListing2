"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket/client";

// Lightweight hook for unread message count only - for badges/navbar
const useUnreadCount = ({ enabled = true, pollMs = 30000 } = {}) => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!enabled || !userId) return;
        setLoading(true);
        try {
            const res = await axios.get("/api/enquiries/unread-count");
            setCount(res.data?.count || 0);
        } catch (err) {
            console.error("Fetch unread count error", err);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, userId]);

    // Optional polling as fallback
    useEffect(() => {
        if (!enabled || !userId || !pollMs || pollMs <= 0) return undefined;
        const id = setInterval(refresh, pollMs);
        return () => clearInterval(id);
    }, [enabled, userId, pollMs, refresh]);

    // Listen to socket events to update count in real-time
    useEffect(() => {
        if (!enabled || !userId) return;
        const socket = getSocket(userId);
        if (!socket) return;

        const handleNew = () => {
            setCount((prev) => prev + 1);
        };

        const handleRead = (payload) => {
            // Decrement by the number of messages marked read for this user
            if (payload?.unreadCountByUser?.[userId] !== undefined) {
                setCount(payload.unreadCountByUser[userId]);
            } else {
                refresh(); // Fallback to full refresh if payload incomplete
            }
        };

        socket.on("message:new", handleNew);
        socket.on("chat:read", handleRead);

        return () => {
            socket.off("message:new", handleNew);
            socket.off("chat:read", handleRead);
        };
    }, [enabled, userId, refresh]);

    return { count, loading, refresh };
};

export default useUnreadCount;
