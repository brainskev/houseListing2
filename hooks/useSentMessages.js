import useCacheFetch from "./useCacheFetch";

/**
 * useSentMessages - fetches sent messages for the current user with instant cache
 * @param {object} options - fetch options (optional)
 * @param {number} ttl - cache time in ms (default 3000)
 * @returns { messages, loading, error, refresh }
 */
export default function useSentMessages(options = {}, ttl = 0) {
    const { data, loading, error, refresh } = useCacheFetch("/api/messages/sent", options, ttl);
    return {
        messages: Array.isArray(data) ? data : [],
        loading,
        error,
        refresh,
    };
}
