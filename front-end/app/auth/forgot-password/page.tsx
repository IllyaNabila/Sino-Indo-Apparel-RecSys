"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    setMsg(data?.message || "If your email exists, you will receive a reset link.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email and we’ll send a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <button
            className="w-full rounded-lg bg-emerald-600 text-white py-2 font-medium disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {msg && <p className="text-sm mt-2">{msg}</p>}

          <Link href="/auth/login" className="text-sm text-emerald-600 hover:underline">
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
