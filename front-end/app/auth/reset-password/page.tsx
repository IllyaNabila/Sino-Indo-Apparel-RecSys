"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  // explanation:
  // (?=.*[a-z]) lowercase
  // (?=.*[A-Z]) uppercase
  // (?=.*\d) number
  // (?=.*[^\w\s]) special char
  // .{8,} length

  const passwordStrong = PASSWORD_RULE.test(password);
  const passwordError =
    password.length === 0
      ? ""
      : !passwordStrong
      ? "Use 8+ chars with uppercase, lowercase, number, and symbol."
      : "";

  const canSubmit = passwordStrong;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setSuccess(false);

    try {
      const { data } = await axios.post(
        "/api/auth/reset-password",
        { token, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setMsg(data?.message || "Success.");
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong.";

      setMsg(message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm mt-2">Missing token. Use the link from your email.</p>
          <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:underline">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        <div className="shadow-xl w-full max-w-md rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">Reset password</h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block text-sm font-medium">New password</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              value={password}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}"
              title="Use 8+ chars with uppercase, lowercase, number, and symbol."
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder="Min 8 characters"
              disabled={success}
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}

            <button
              className="w-full rounded-lg bg-emerald-600 text-white py-2 font-medium disabled:opacity-60"
              disabled={loading || success || !canSubmit}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>

            {msg && <p className="text-sm mt-2">{msg}</p>}

          </form>
        </div>
      </div>
    </div>
  );
}
