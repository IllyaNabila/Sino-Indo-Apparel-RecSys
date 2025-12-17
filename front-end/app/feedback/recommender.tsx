"use client";

import { useState, FormEvent } from "react";

// Define a type for the recommendation items for better type safety.
// You should adjust this to match the actual shape of your recommendation data.
interface Recommendation {
  id: number;
  name: string;
  description: string;
  image_url: string;
  score: number;
}

export default function RecommendPage() {
  const [query, setQuery] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Mock user data ---
  // In a real application, you would get this from your authentication context (e.g., Clerk, NextAuth, etc.)
  const mockUser = {
    userId: "user-12345",
    userRole: "customer",
  };
  // --------------------

  const getRecommendations = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userId: mockUser.userId,
          userRole: mockUser.userRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      // Assuming the API returns an array of recommendations directly.
      // If it's nested under a key, like { recommendations: [...] },
      // you'll need to adjust this to `data.recommendations`.
      setRecommendations(data);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Apparel Recommender
      </h1>

      <form
        onSubmit={getRecommendations}
        className="flex justify-center gap-2 mb-8"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'red cotton shirt for summer'"
          className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-center text-red-500">{error}</p>}

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={item.image_url || "https://via.placeholder.com/300"}
                alt={item.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Score: {item.score.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
