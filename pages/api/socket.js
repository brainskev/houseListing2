import { initSocketServer } from "@/lib/socket/server";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (!res.socket.server.io) {
        const io = initSocketServer(res.socket.server);
        res.socket.server.io = io;
    }
    res.end();
}
