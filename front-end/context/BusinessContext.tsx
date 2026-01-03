"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

type BusinessContextType = {
  businessId: string;
  companyName: string;
  businessObject: any;
  setBusinessId: (id: string) => void;
  setCompanyName: (name: string) => void;
  setBusinessObject: (business: any) => void;
  clearBusiness: () => void;
};

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [businessId, setBusinessId] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("businessId") || ""
      : ""
  );
  const [companyName, setCompanyName] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("companyName") || ""
      : ""
  );

  const [businessObject, setBusinessObject] = useState<any>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const item = localStorage.getItem("businessObject");
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("businessId", businessId);
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("businessObject", JSON.stringify(businessObject));
  }, [businessId, companyName, businessObject]);

  const clearBusiness = () => {
    setBusinessId("");
    setCompanyName("");
    setBusinessObject("");
    localStorage.removeItem("businessId");
    localStorage.removeItem("companyName");
    localStorage.removeItem("businessObject");
  };

  return (
    <BusinessContext.Provider
      value={{
        businessId,
        companyName,
        businessObject,
        setBusinessId,
        setCompanyName,
        setBusinessObject,
        clearBusiness,
      }}
    >
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
