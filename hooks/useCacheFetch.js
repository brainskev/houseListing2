import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useCacheFetch - Optimized fetch with optional polling
 * @param {string} url - API endpoint
 * @param {object} options - fetch options
 * @param {number} ttl - cache/poll interval in ms (0 disables polling)
 * @returns { data, loading, error, refresh }
 */
const cache = {};
const timers = {};
const inFlight = {};

export function resetCache() {
    Object.keys(cache).forEach((k) => delete cache[k]);
    Object.keys(timers).forEach((k) => {
        clearTimeout(timers[k]);
        delete timers[k];
    });
    Object.keys(inFlight).forEach((k) => delete inFlight[k]);
}

export default function useCacheFetch(url, options = {}, ttl = 10000) {
    const isEnabled = Boolean(url);
    const effectiveTtl = Number.isFinite(ttl) && ttl > 0 ? ttl : 0; // 0 disables polling
    const [data, setData] = useState(isEnabled ? cache[url]?.data || null : null);
    const [loading, setLoading] = useState(isEnabled && !cache[url]);
    const [error, setError] = useState(null);

    const mounted = useRef(true);
    const lastFetchTimeRef = useRef(0);
    const isInitialLoad = useRef(true);
    const isPageVisibleRef = useRef(true);

    // Fetch function
    const fetchData = useCallback(
        async (force = false) => {
            if (!url) return;

            const noStore = options?.cache === "no-store";

            // Use cached data if valid
            if (!noStore && !force && cache[url] && Date.now() - cache[url].ts < effectiveTtl) {
                if (mounted.current) {
                    setData(cache[url].data);
                    setLoading(false);
                }
                return;
            }

            // Reuse in-flight request
            if (!force && inFlight[url]) {
                try {
                    await inFlight[url];
                    if (mounted.current && cache[url]) setData(cache[url].data);
                } catch (err) {
                    if (mounted.current) setError(err.message);
                }
                return;
            }

            // Prevent duplicate rapid requests
            const now = Date.now();
            if (!force && now - lastFetchTimeRef.current < 500) return;
            lastFetchTimeRef.current = now;

            if (isInitialLoad.current) setLoading(true);
            setError(null);

            const fetchPromise = (async () => {
                const res = await fetch(url, options);
                if (!res.ok) throw new Error((await res.json())?.message || "Failed to fetch");
                const json = await res.json();
                if (!noStore) cache[url] = { data: json, ts: Date.now() };
                return json;
            })();

            inFlight[url] = fetchPromise;

            try {
                const json = await fetchPromise;
                if (mounted.current) setData(json);
            } catch (err) {
                if (mounted.current) setError(err.message);
            } finally {
                if (inFlight[url] === fetchPromise) delete inFlight[url];
                if (mounted.current) setLoading(false);
                isInitialLoad.current = false;
            }
        },
        [url, options, effectiveTtl]
    );

    // Initial fetch on mount
    useEffect(() => {
        mounted.current = true;
        isInitialLoad.current = true;

        if (!url) {
            setLoading(false);
            return () => (mounted.current = false);
        }

        fetchData();

        return () => {
            mounted.current = false;
        };
    }, [url, fetchData]);

    // Page visibility: refresh once when tab becomes visible
    useEffect(() => {
        if (!url || effectiveTtl <= 0) return;

        const handleVisibility = () => {
            isPageVisibleRef.current = !document.hidden;
            if (isPageVisibleRef.current) fetchData(true);
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [url, fetchData, effectiveTtl]);

    // Auto-refresh polling
    useEffect(() => {
        if (!url || effectiveTtl <= 0) return;

        if (timers[url]) clearTimeout(timers[url]);

        const scheduleNext = () => {
            if (!isPageVisibleRef.current) {
                timers[url] = setTimeout(scheduleNext, 5000);
                return;
            }

            timers[url] = setTimeout(() => {
                if (mounted.current && isPageVisibleRef.current) {
                    fetchData(true);
                    scheduleNext();
                }
            }, effectiveTtl);
        };

        scheduleNext();

        return () => {
            if (timers[url]) clearTimeout(timers[url]);
        };
    }, [url, effectiveTtl, fetchData]);

    const refresh = useCallback(() => {
        if (!url) return;
        isInitialLoad.current = false;
        fetchData(true);
    }, [fetchData, url]);

    return { data, loading, error, refresh };
}
