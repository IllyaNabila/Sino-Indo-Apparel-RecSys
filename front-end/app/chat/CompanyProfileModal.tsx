"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string | null;
}

export const CompanyProfileModal = ({ isOpen, onClose, businessId }: CompanyProfileModalProps) => {
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && businessId) {
      const fetchCompanyData = async () => {
        setIsLoading(true);
        try {
          // NOTE: This assumes an API endpoint exists to fetch business details by ID.
          // You may need to create this endpoint.
          const { data } = await axios.get(`/api/business/${businessId}`);
          setCompanyData(data);
        } catch (error) {
          console.error("Failed to fetch company data:", error);
          // Handle error, e.g., show a toast notification
        } finally {
          setIsLoading(false);
        }
      };
      fetchCompanyData();
    }
  }, [isOpen, businessId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{companyData?.companyName || "Company Profile"}</DialogTitle>
          <DialogDescription>
            Details for {companyData?.companyName || "this business"}.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : companyData ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-slate-500" />
              <p className="font-medium">{companyData.companyName}</p>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-500 mt-1" />
              <p>{companyData.address}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-slate-500" />
              <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {companyData.website}
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{companyData.description}</p>
            </div>
          </div>
        ) : <p>Could not load company details.</p>}
      </DialogContent>
    </Dialog>
  );
};