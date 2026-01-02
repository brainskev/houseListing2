"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket/client";

// Manages a single enquiry conversation: fetches messages, joins the room, and applies server-driven unread maps.
// Default poll is 5s as a safety net; sockets remain the primary delivery path.
export default function useEnquiryThread(enquiryId, { pollMs = 5000 } = {}) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [enquiry, setEnquiry] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const joinedRef = useRef(false);

    const unreadCountForMe = useMemo(() => {
        if (!enquiry?.unreadCountByUser || !userId) return 0;
        return enquiry.unreadCountByUser[userId] || enquiry.unreadCountByUser.get?.(userId) || 0;
    }, [enquiry, userId]);

    const fetchThread = useCallback(async () => {
        if (!enquiryId || !userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/enquiries/${enquiryId}/messages`);
            setEnquiry(res.data?.enquiry || null);
            setMessages(res.data?.messages || []);
        } finally {
            setLoading(false);
        }
    }, [enquiryId, userId]);

    useEffect(() => {
        fetchThread();
    }, [fetchThread]);

    // Optional light background refresh while the thread is open (disabled by default to observe live delivery).
    useEffect(() => {
        if (!enquiryId || !userId || !pollMs || pollMs <= 0) return undefined;
        const id = setInterval(() => {
            fetchThread();
        }, pollMs);
        return () => clearInterval(id);
    }, [enquiryId, userId, pollMs, fetchThread]);

    // Join room once per enquiry to receive real-time updates.
    useEffect(() => {
        if (!enquiryId || !userId) return;
        const socket = getSocket(userId);
        if (!socket) return;

        const joinRoom = () => {
            socket.emit("chat:join", { enquiryId });
            joinedRef.current = true;
        };

        // Join immediately and on reconnect
        joinRoom();
        socket.on("connect", joinRoom);

        const handleNew = (payload) => {
            if (payload?.enquiryId !== enquiryId) return;
            setEnquiry((prev) => ({ ...prev, unreadCountByUser: payload.unreadCountByUser || prev?.unreadCountByUser, lastMessageAt: payload.message?.createdAt || prev?.lastMessageAt }));
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === payload.message?._id);
                if (exists) return prev;
                return [...prev, payload.message];
            });
        };

        const handleRead = (payload) => {
            if (payload?.enquiryId !== enquiryId) return;
            setEnquiry((prev) => ({ ...prev, unreadCountByUser: payload.unreadCountByUser || prev?.unreadCountByUser }));
        };

        socket.on("message:new", handleNew);
        socket.on("chat:read", handleRead);
        return () => {
            socket.off("connect", joinRoom);
            socket.off("message:new", handleNew);
            socket.off("chat:read", handleRead);
        };
    }, [enquiryId, userId]);

    const sendMessage = useCallback(
        async (text) => {
            if (!text || !text.trim() || !enquiryId) return;
            setSending(true);
            try {
                const res = await axios.post(`/api/enquiries/${enquiryId}/messages`, { text });
                setEnquiry(res.data?.enquiry || null);
                setMessages((prev) => [...prev, res.data?.message]);
            } finally {
                setSending(false);
            }
        },
        [enquiryId]
    );

    const markRead = useCallback(async () => {
        if (!enquiryId) return;
        await axios.post(`/api/enquiries/${enquiryId}/read`);
        await fetchThread();
    }, [enquiryId, fetchThread]);

    return {
        enquiry,
        messages,
        loading,
        sending,
        sendMessage,
        markRead,
        unreadCountForMe,
    };
}
