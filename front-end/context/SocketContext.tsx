"use-client"

import { io, Socket } from "socket.io-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useBusiness } from "./BusinessContext";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

type SocketContextType = {
    socket: Socket | null;
    notifications: any[];
    clearNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { businessId } = useBusiness();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!businessId) {
            if (socket) socket.disconnect();
            setSocket(null);
            return;
        }

        const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });
        setSocket(newSocket);

        // join personal notification channel
        newSocket.emit("personalChanenl", businessId);

        // global notifications
        newSocket.on("newNotification", (data: any) => {
            console.log("New notification:", data);
            setNotifications((prev) => [...prev, data]);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        }
    }, [businessId]);

    const clearNotification = () => setNotifications([]);

    return (
        <SocketContext.Provider value={{ socket, notifications, clearNotification }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used within a SocketProvider");
    return context;
};