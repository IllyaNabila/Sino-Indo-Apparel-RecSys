"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/context/BusinessContext";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function ProfileButton() {
  const [isLoading, setLoading] = useState(false);
  const [companyInitials, setCompanyInitials] = useState("");
  const { companyName, businessObject } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (businessObject?.companyName) {
      const initials = businessObject.companyName
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      setCompanyInitials(initials);
    }
  }, [businessObject]);

  const handleNavigation = async (path: string) => {
    setLoading(true);
    await router.push(path);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="group border-slate-200 bg-white px-3 py-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
      disabled={isLoading}
      onClick={() => handleNavigation("/profile")}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white font-semibold flex items-center justify-center shadow-sm">
          {companyInitials}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold leading-none text-slate-900">{companyName}</span>
          <span className="text-xs text-slate-500">{businessObject?.role}</span>
        </div>
        
      </div>
    </Button>
  );
}