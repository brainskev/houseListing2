// Placeholder hook while chat backend is removed. Returns empty data without network calls.
export default function useMessages() {
    return {
        messages: [],
        loading: false,
        error: null,
        refresh: () => { },
    };
}
