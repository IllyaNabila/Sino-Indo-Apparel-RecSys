"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
type BusinessContextType = {
    businessId: string,
    companyName: string,
    setBusinessId: (id: string) => void;
    setCompanyName: (name: string) => void;
    socket: Socket | null;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [businessId, setBusinessId] = useState<string>(
        typeof window !== 'undefined' ? localStorage.getItem("businessId") || "" : "" 
    );
    const [companyName, setCompanyName] = useState<string>(
        typeof window !== 'undefined' ? localStorage.getItem("companyName") || "" : "" 
    );
    const [socket, setSocket] = useState<Socket | null>(null); 
    
    useEffect(() => {
        localStorage.setItem("businessId", businessId);
        localStorage.setItem("companyName", companyName);
    }, [businessId, companyName]);

    useEffect(() => {

        if(!businessId) {
            if (socket){
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(URL, {
            transports: ["websocket"],
            autoConnect: true,
        });

        setSocket(newSocket);
        newSocket.emit("personalChannel", businessId);
        newSocket.on("newNotification", (data: any) => {
            console.log("new notification received:", data);
        });

        return () => {
            if (socket){
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [businessId]);

    return (
        <BusinessContext.Provider value={{ businessId, companyName, setBusinessId, setCompanyName, socket}}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (!context) {
        throw new Error("useBusiness must be used within a BusinessProvider");
    }
    return context;
}