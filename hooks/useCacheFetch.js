import { useRef, useState, useEffect } from "react";

/**
 * useCacheFetch - fast client fetch with memory cache and revalidation
 * @param {string} url - fetch URL
 * @param {object} options - fetch options (optional)
 * @param {number} ttl - cache time in ms (default 3000)
 * @returns { data, loading, error, refresh }
 */
const cache = {};
const timers = {};

export default function useCacheFetch(url, options = {}, ttl = 3000) {
    const [data, setData] = useState(cache[url]?.data || null);
    const [loading, setLoading] = useState(!cache[url]);
    const [error, setError] = useState(null);
    const mounted = useRef(true);

    const fetchData = async (force = false) => {
        if (!force && cache[url] && Date.now() - cache[url].ts < ttl) {
            setData(cache[url].data);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error((await res.json())?.message || "Failed to fetch");
            const json = await res.json();
            cache[url] = { data: json, ts: Date.now() };
            if (mounted.current) setData(json);
        } catch (err) {
            if (mounted.current) setError(err.message);
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        mounted.current = true;
        fetchData();
        return () => {
            mounted.current = false;
        };
        // eslint-disable-next-line
    }, [url]);

    // Auto revalidate after ttl (disabled if ttl is 0 or falsy)
    useEffect(() => {
        if (!ttl) return;
        if (timers[url]) clearTimeout(timers[url]);
        timers[url] = setTimeout(() => fetchData(true), ttl);
        return () => {
            if (timers[url]) clearTimeout(timers[url]);
        };
    }, [url, ttl, fetchData]);

    return { data, loading, error, refresh: () => fetchData(true) };
}
