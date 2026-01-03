"use client";

import { io, Socket } from "socket.io-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useBusiness } from "./BusinessContext";
import axios from "axios";
import { useRef } from "react";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

type SocketContextType = {
  socket: Socket | null;
  unreadCounts: Record<string, number>;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  selectedChat: string | null;
  setSelectedChat: (id: string | null) => void;
  notifications: any[];
  setNotifications: (notifications: any) => void;
  clearNotification: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { businessId } = useBusiness();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const selectedChatRef = useRef<string | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!businessId) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    fetchUnread();

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
    setSocket(newSocket);

    // join personal notification channel
    newSocket.emit("personalChannel", businessId);

    // global notifications
    newSocket.on("newNotification", (data: any) => {
        const { selectedChat: chatId, msg } = data;
        console.log("New notification:", data);
        console.log("selectedChat socket context:", selectedChat);
        console.log("chatId socket context", chatId);
        setUnreadCounts((prev) => ({
            ...prev,
            [chatId]: selectedChatRef.current === chatId ? 0 : (prev[chatId] || 0) + 1,
        }))
        setNotifications((prev) => [...prev, data]);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [businessId])

  useEffect(() => {
    const updateUnread = async () => {
      if (Object.keys(unreadCounts).length == 0) return;
      try {
        const res = await axios.patch("/api/chat/unread", unreadCounts);
        if (res.status === 200) {
          console.log("success")
        }
      } catch (error: any) {
        console.error("Error update unread message:", error);
      }
    };
    updateUnread();
  }, [notifications, unreadCounts]);

  useEffect(() => {
    console.log("selected chat context:", selectedChat)
  }, [selectedChat]);

  const fetchUnread = async () => {
    try {
        const res = await axios.get("/api/chat/unread");
        if (res.status === 200) {
          console.log("success")
        }
        setUnreadCounts(res.data);
        console.log("Fetched unread counts:", res.data);
      } catch (error: any) {
        console.error("Error fetch unread message:", error);
      }
  };

  const clearNotification = () => setNotifications([]);

  return (
    <SocketContext.Provider
      value={{ socket, unreadCounts, setUnreadCounts, notifications, setNotifications, clearNotification, selectedChat, setSelectedChat }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
