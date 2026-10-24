"use client";

import type React from "react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Factory } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import axios from 'axios'
import toast from 'react-hot-toast'
import { toastApiError } from "@/lib/toastApiError";

//import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
//import { auth } from "@/app/firebase/config";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  //const [createUserWithEmailAndPassword, userCredential, loading, hookError] = useCreateUserWithEmailAndPassword(auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreeToTerms: false,
  });

  const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  // explanation:
  // (?=.*[a-z]) lowercase
  // (?=.*[A-Z]) uppercase
  // (?=.*\d) number
  // (?=.*[^\w\s]) special char
  // .{8,} length

  const password = formData.password;
  const confirmPassword = formData.confirmPassword;

  const passwordStrong = PASSWORD_RULE.test(password);
  const passwordsMatch = password === confirmPassword;

  const passwordError =
    password.length === 0
      ? ""
      : !passwordStrong
      ? "Use 8+ chars with uppercase, lowercase, number, and symbol."
      : "";

  const confirmError =
    confirmPassword.length === 0
      ? ""
      : !passwordsMatch
      ? "Passwords do not match."
      : "";

  const canSubmit = passwordStrong && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', formData)
      console.log("Signup success", response.data);
      router.push('/auth/business-details')
      toast.success("Signup success")
    } catch (error) {
      toastApiError(error)
    }
    setLoading(false);
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
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Join the global apparel business network
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
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}"
                  title="Use 8+ chars with uppercase, lowercase, number, and symbol."
                  placeholder="Create a strong password"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  aria-invalid={!!passwordError}
                />
                {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}"
                  title="Use 8+ chars with uppercase, lowercase, number, and symbol."
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  aria-invalid={!!confirmError}
                />
                {confirmError && (
                  <p className="text-sm text-red-600">{confirmError}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Business Role</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="manufacturer" id="manufacturer" />
                    <Factory className="h-5 w-5 text-slate-600" />
                    <div>
                      <Label
                        htmlFor="manufacturer"
                        className="font-medium cursor-pointer"
                      >
                        Manufacturer
                      </Label>
                      <p className="text-sm text-slate-600">
                        I produce apparel products
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                    <RadioGroupItem value="importer" id="importer" />
                    <Building2 className="h-5 w-5 text-slate-600" />
                    <div>
                      <Label
                        htmlFor="importer"
                        className="font-medium cursor-pointer"
                      >
                        Importer
                      </Label>
                      <p className="text-sm text-slate-600">
                        I source and import apparel products
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      agreeToTerms: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-emerald-600 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-emerald-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
              
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!formData.agreeToTerms || !formData.role || isLoading || !canSubmit}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Survey Preview */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-1">
                What's Next?
              </p>
              <p className="text-xs text-blue-700">
                After registration, you'll complete a quick 2-minute survey to
                personalize your experience and get better recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
