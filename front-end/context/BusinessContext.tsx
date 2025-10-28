"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type BusinessContextType = {
    businessId: string,
    companyName: string,
    setBusinessId: (id: string) => void;
    setCompanyName: (name: string) => void;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [businessId, setBusinessId] = useState<string>(
        typeof window !== 'undefined' ? localStorage.getItem("businessId") || "" : "" 
    );
    const [companyName, setCompanyName] = useState<string>(
        typeof window !== 'undefined' ? localStorage.getItem("companyName") || "" : "" 
    );
        
    useEffect(() => {
        localStorage.setItem("businessId", businessId);
        localStorage.setItem("companyName", companyName);
    }, [businessId, companyName]);

    return (
        <BusinessContext.Provider value={{ businessId, companyName, setBusinessId, setCompanyName}}>
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
};