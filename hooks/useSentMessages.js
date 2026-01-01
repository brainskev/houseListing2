import { useEffect, useRef, useState } from "react";
import useCacheFetch from "./useCacheFetch";

// Sent messages: match inbox cadence to keep threads consistent
export default function useSentMessages(options = {}) {
    const [messages, setMessages] = useState([]);
    const lastSeenRef = useRef(null);
    const { enabled = true, ttl = 5000 } = options;

    const sinceParam = lastSeenRef.current ? `?since=${encodeURIComponent(lastSeenRef.current)}` : "";
    const url = enabled ? `/api/messages/sent${sinceParam}` : null;

    const { data, loading, error, refresh } = useCacheFetch(url, { cache: "no-store" }, enabled ? ttl : null);

    useEffect(() => {
        if (!Array.isArray(data)) return;
        setMessages((prev) => {
            const map = new Map();
            const merged = [...prev, ...data];
            for (const m of merged) {
                if (!m?._id) continue;
                map.set(m._id, m);
            }
            const deduped = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const newest = deduped.length ? deduped[0].createdAt : lastSeenRef.current;
            if (newest) lastSeenRef.current = newest;
            return deduped;
        });
    }, [data]);

    return {
        messages,
        loading,
        error,
        refresh,
    };
}
