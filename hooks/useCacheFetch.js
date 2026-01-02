import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useCacheFetch - Resource-optimized fetch with Page Visibility API
 * Intelligently pauses polling when tab is inactive, resumes when active
 * @param {string} url - fetch URL
 * @param {object} options - fetch options (optional)
 * @param {number} ttl - cache time in ms (default 10000 for better resource efficiency)
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
    const effectiveTtl = Number.isFinite(ttl) && ttl > 0 ? ttl : Infinity;
    const [data, setData] = useState(isEnabled ? cache[url]?.data || null : null);
    const [loading, setLoading] = useState(isEnabled && !cache[url]);
    const [error, setError] = useState(null);
    const mounted = useRef(true);
    const isInitialLoad = useRef(true);
    const lastFetchTimeRef = useRef(0);
    const isPageVisibleRef = useRef(true);

    const fetchData = useCallback(async (force = false) => {
        // Skip if URL is invalid
        if (!url) return;

        const noStore = options?.cache === "no-store";

        // Use cache if valid and not forced (unless no-store is requested)
        if (!noStore && !force && cache[url] && Date.now() - cache[url].ts < effectiveTtl) {
            if (mounted.current) {
                setData(cache[url].data);
                setLoading(false);
            }
            return;
        }

        // Reuse in-flight request for same URL to avoid duplicate GETs
        if (!force && inFlight[url]) {
            try {
                await inFlight[url];
                if (mounted.current && cache[url]) {
                    setData(cache[url].data);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted.current) setError(err.message);
            }
            return;
        }

        // Prevent duplicate simultaneous requests
        const now = Date.now();
        if (!force && now - lastFetchTimeRef.current < 500) {
            return;
        }
        lastFetchTimeRef.current = now;

        // Only show loading on initial fetch, not on background refreshes
        if (isInitialLoad.current) {
            setLoading(true);
        }
        setError(null);

        const fetchPromise = (async () => {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error((await res.json())?.message || "Failed to fetch");
            const json = await res.json();
            if (!noStore) {
                cache[url] = { data: json, ts: Date.now() };
            }
            return json;
        })();

        inFlight[url] = fetchPromise;

        try {
            const json = await fetchPromise;
            if (mounted.current) {
                setData(json);
                setError(null);
            }
        } catch (err) {
            if (mounted.current) {
                setError(err.message);
            }
        } finally {
            if (inFlight[url] === fetchPromise) {
                delete inFlight[url];
            }
            if (mounted.current) {
                setLoading(false);
            }
            isInitialLoad.current = false;
        }
    }, [url, ttl, options, effectiveTtl]);

    // Initial fetch only
    useEffect(() => {
        mounted.current = true;
        isInitialLoad.current = true;

        if (!url) {
            setLoading(false);
            return () => {
                mounted.current = false;
            };
        }

        fetchData();

        return () => {
            mounted.current = false;
        };
    }, [url, fetchData]);

    // Page Visibility API - Pause/Resume polling based on tab visibility
    useEffect(() => {
        // Only set up visibility handler if polling is enabled (ttl > 0)
        if (!url || !Number.isFinite(ttl) || ttl <= 0) return undefined;

        const handleVisibilityChange = () => {
            isPageVisibleRef.current = !document.hidden;

            // When page becomes visible, immediately refresh data
            if (isPageVisibleRef.current && mounted.current) {
                isInitialLoad.current = false;
                fetchData(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchData, url, ttl]);

    // Auto revalidate in background after ttl (only if page is visible)
    useEffect(() => {
        if (!url || !Number.isFinite(ttl) || ttl <= 0) return undefined;

        if (timers[url]) clearTimeout(timers[url]);

        // Only set up auto-refresh if page is visible
        const scheduleNextFetch = () => {
            if (!isPageVisibleRef.current) {
                // Page is hidden, check again in 5 seconds
                timers[url] = setTimeout(scheduleNextFetch, 5000);
                return;
            }

            // Page is visible, fetch with normal TTL
            timers[url] = setTimeout(() => {
                if (mounted.current && isPageVisibleRef.current) {
                    fetchData(true);
                    scheduleNextFetch();
                }
            }, ttl);
        };

        scheduleNextFetch();

        return () => {
            if (timers[url]) clearTimeout(timers[url]);
        };
    }, [url, ttl, fetchData]);

    const refresh = useCallback(() => {
        if (!url) return;
        isInitialLoad.current = false;
        fetchData(true);
    }, [fetchData, url]);

    return { data, loading, error, refresh };
}
