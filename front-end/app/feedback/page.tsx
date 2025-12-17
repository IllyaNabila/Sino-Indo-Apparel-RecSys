"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/context/BusinessContext";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { businessId, businessObject } = useBusiness();

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      {/**const res = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });*/}

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userId: businessId,
          userRole: businessObject.role,
        }),
      });

      const data = await res.json();
      console.log(res)
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }
      setResult(data);
      console.log(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Next.js + FastAPI (AI Microservice)</h1>

      <input
        className="border rounded px-3 py-2 w-80"
        placeholder="Type a query, e.g. breathable cotton for children wear"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        onClick={handlePredict}
        disabled={loading || !query.trim()}
      >
        {loading ? "Predicting..." : "Send to AI Service"}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {result && (
        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm max-w-xl w-full overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
