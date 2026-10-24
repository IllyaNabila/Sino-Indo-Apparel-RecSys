import { io, Socket } from "socket.io-client";

const URL = (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000").replace(/\/+$/, "");

export const socket: Socket = io(URL, {
    transports: ["polling", "websocket"],
    autoConnect: false,
});