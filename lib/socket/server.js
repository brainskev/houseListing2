import { Server } from "socket.io";

let io;

export function initSocketServer(server) {
    if (io) return io;
    io = new Server(server, {
        path: "/api/socket",
        cors: {
            origin: process.env.NEXT_PUBLIC_DOMAIN || "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId || null;

        socket.on("chat:join", ({ enquiryId }) => {
            if (!enquiryId) return;
            const roomId = enquiryId.toString();
            socket.join(roomId);
            socket.emit("chat:joined", { enquiryId: roomId });
            socket.to(roomId).emit("chat:joined", { enquiryId: roomId, userId });
        });
    });

    return io;
}

export function getIO() {
    return io;
}
