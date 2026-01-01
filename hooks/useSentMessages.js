// Placeholder hook while chat backend is removed. Returns empty data without network calls.
export default function useSentMessages() {
    return {
        messages: [],
        loading: false,
        error: null,
        refresh: () => { },
    };
}
