"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Package,
  MessageSquare,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  CheckCircle,
  ShieldOff,
} from "lucide-react";

import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { useBusiness } from "@/context/BusinessContext";

export default function Navigation() {
  const { unreadCounts } = useSocket();
  const { setBusinessId, clearBusiness, businessObject } = useBusiness();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isVerified = !!businessObject?.verified;
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Messages", href: "/chat", icon: MessageSquare, badge: Object.values(unreadCounts).filter((count) => count > 0).length },
    { name: "Search", href: "/search", icon: Search },
    //{ name: "Partners", href: "/partners", icon: Users },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  const router = useRouter();
  const logout = async () => {
    try {
      await axios.get("/api/auth/logout");
      clearBusiness();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      console.log(error.message);

      toast.error(error.message);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            {/*<div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
            <img src="/sino-indo logo.png" className="w-8 h-8 rounded-lg"></img>*/}
            <span className="ml-2 font-bold text-xl text-slate-800">
              Sino-Indo Apparel Matcher
            </span>
          </div>

          {/* User Status */}
          <div className="mt-6 px-4">
            {!isVerified ? (
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                <ShieldOff className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Unverified Business
                </span>
              </div>
            ) : (
            <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Verified Business
              </span>
            </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? "text-blue-700"
                      : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                {item.name}
                {item.badge ? (
                  <Badge className="ml-auto bg-blue-500 text-white">
                    {item.badge}
                  </Badge>
                ): (
                  ""
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 px-2 space-y-1">
            <Link
              href="/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <User className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
            <span className="font-bold text-xl text-slate-800">
              Sino-Indo Apparel Matcher
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="font-semibold text-lg">Menu</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? "bg-emerald-100 text-emerald-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                        {item.badge && (
                          <Badge className="ml-auto bg-emerald-600 text-white">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <User className="mr-3 h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Spacer for Desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />
    </>
  );
}
