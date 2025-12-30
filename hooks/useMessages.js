import useCacheFetch from "./useCacheFetch";

/**
 * useMessages - fetches inbox messages for the current user with instant cache
 * @param {object} options - fetch options (optional)
 * @param {number} ttl - cache time in ms (default 3000)
 * @returns { messages, loading, error, refresh }
 */
export default function useMessages(options = {}, ttl = 0) {
    const { data, loading, error, refresh } = useCacheFetch("/api/messages", options, ttl);
    return {
        messages: Array.isArray(data) ? data : [],
        loading,
        error,
        refresh,
    };
}
