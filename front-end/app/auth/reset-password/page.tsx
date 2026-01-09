"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json().catch(() => ({}));
    setMsg(data?.message || (res.ok ? "Success." : "Something went wrong."));
    setLoading(false);
    setSuccess(true);
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Reset password</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-sm font-medium">New password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={3}
            required
            placeholder="Min 8 characters"
            disabled={success}
          />

          <button
            className="w-full rounded-lg bg-emerald-600 text-white py-2 font-medium disabled:opacity-60"
            disabled={loading || success}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          {msg && <p className="text-sm mt-2">{msg}</p>}

          <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">
            Go to login
          </Link>
        </form>
      </div>
    </div>
  );
}
