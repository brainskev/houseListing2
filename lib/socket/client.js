import { io } from "socket.io-client";

let socket;

export function getSocket(userId) {
    if (typeof window === "undefined") return null;
    if (!userId) return null;

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_DOMAIN || undefined, {
            path: "/api/socket",
            auth: { userId },
            withCredentials: true,
            autoConnect: true,
            transports: ["polling", "websocket"], // start with polling to avoid early WS close
            reconnectionAttempts: 5,
            reconnectionDelay: 500,
        });
    } else if (socket.auth?.userId !== userId) {
        socket.auth = { ...(socket.auth || {}), userId };
        if (!socket.connected) socket.connect();
    }

    if (!socket.connected) {
        socket.connect();
    }

    socket.on("connect_error", (err) => {
        console.error("Socket connect_error", err?.message || err);
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
