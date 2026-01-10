"use client";

import type React from "react";
import { useBusiness } from "@/context/BusinessContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const { businessId, companyName, businessObject, setBusinessObject, setBusinessId, setCompanyName } = useBusiness();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleNavigation = async (path: string) => {
    setLoading(true);
    await router.push(path);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // prevents double submit

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", formData, {
        timeout: 8000, // optional: avoid hanging forever
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Login success");

      setBusinessId(response.data.businessId);
      setCompanyName(response.data.companyName);
      setBusinessObject(response.data.businessObject);

      router.push("/dashboard");
    } catch (err: unknown) {
      // Default fallback message
      let message = "Login failed. Please try again.";

      // Axios-specific handling
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        // If backend returns a message like { error: "..."} or { message: "..." }
        const apiMsg =
          (err.response?.data as any)?.error ||
          (err.response?.data as any)?.message;

        if (typeof apiMsg === "string" && apiMsg.trim()) {
          message = apiMsg;
        } else if (!err.response) {
          // No response = network / CORS / server down
          message = "No response from server. Check your internet and try again.";
        } else if (status === 401) {
          message = "Invalid email or password.";
        } else if (status === 403) {
          message = "Not allowed.";
        } else if (status === 429) {
          message = "Too many attempts. Please wait a moment and try again.";
        } else if (status && status >= 500) {
          message = "Server error. Please try again later.";
        } else if (err.code === "ECONNABORTED") {
          message = "Request timed out. Please try again.";
        }
      }

      // Log for debugging (keep it, but don't show raw error to user)
      console.error("Login failed:", err);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mx-auto">
              <img
                src="/logo-apparelbiz.png"
                alt="ApparelBiz logo"
                className="w-20 h-20 rounded-lg object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Sino-Indo Apparel Matcher account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                {/**
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        rememberMe: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div> */}
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? 
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </> 
                : 
                "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">Admin Access</p>
                <Button variant="outline" className="w-full" onClick={() => handleNavigation("/admin/login")}>
                  Admin Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
