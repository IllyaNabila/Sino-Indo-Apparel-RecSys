"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/chart";
import {
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  RefreshCw,
  ChevronLeft, ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";
import axios from "axios";

// Dynamically import the ProfileButton with SSR turned off
const ProfileButton = dynamic(() => import("@/app/dashboard/ProfileButton"), {
  ssr: false,
});

// ✅ Keep your mock chart data as fallback
const TREND_DATA = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "T-shirts",
      data: [65, 78, 86, 61, 98, 110],
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      borderColor: "rgb(59, 130, 246)",
    },
    {
      label: "Jeans",
      data: [28, 48, 40, 19, 45, 60],
      backgroundColor: "rgba(99, 102, 241, 0.5)",
      borderColor: "rgb(99, 102, 241)",
    },
    {
      label: "Dresses",
      data: [45, 60, 55, 30, 70, 85],
      backgroundColor: "rgba(236, 72, 153, 0.5)",
      borderColor: "rgb(236, 72, 153)",
    },
  ],
};

const REGION_DATA = {
  labels: ["North China", "East China", "South China", "West China", "Central China"],
  datasets: [
    {
      label: "Market Share",
      data: [35, 25, 20, 10, 10],
      backgroundColor: [
        "rgba(59, 130, 246, 0.7)",
        "rgba(99, 102, 241, 0.7)",
        "rgba(236, 72, 153, 0.7)",
        "rgba(16, 185, 129, 0.7)",
        "rgba(245, 158, 11, 0.7)",
      ],
      borderColor: [
        "rgb(59, 130, 246)",
        "rgb(99, 102, 241)",
        "rgb(236, 72, 153)",
        "rgb(16, 185, 129)",
        "rgb(245, 158, 11)",
      ],
      borderWidth: 1,
    },
  ],
};

const SEASONAL_DATA = {
  labels: ["Spring", "Summer", "Fall", "Winter"],
  datasets: [
    {
      label: "T-shirts",
      data: [65, 120, 80, 30],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.3,
    },
    {
      label: "Jeans",
      data: [70, 50, 90, 85],
      borderColor: "rgb(99, 102, 241)",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      tension: 0.3,
    },
    {
      label: "Outerwear",
      data: [30, 20, 85, 110],
      borderColor: "rgb(236, 72, 153)",
      backgroundColor: "rgba(236, 72, 153, 0.1)",
      tension: 0.3,
    },
  ],
};

// ---- Types (keep loose if you want) ----
type ChartJsData = { labels: string[]; datasets: any[] };

type RecentActivityItem = {
  type: "message" | "product" | "license" | "connection";
  content: string;
  time: string; // already formatted server-side
  status: "new" | "viewed" | "inquiry" | "approved" | "pending" | "rejected";
};

type RecommendedProduct = {
  name: string;
  company: string;
  price?: string; // since your product schema stores priceMin/priceMax as strings
  moq?: string;
  image?: string;
};

type RecommendedCompany = {
  name: string;
  type: string;
  location: string;
  verified: boolean;
  products: number;
};

type DashboardAnalyticsResponse = {
  charts?: {
    trendData?: ChartJsData;
    regionData?: ChartJsData;
    seasonalData?: ChartJsData;
  };
  recentActivity?: RecentActivityItem[];
  recommendedProducts?: RecommendedProduct[];
  recommendedCompanies?: RecommendedCompany[];
};

export default function DashboardPage() {
  const router = useRouter();

  // Your existing filter state (already in file)
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [season, setSeason] = useState("all");
  const [demographic, setDemographic] = useState("all");

  // ✅ New: analytics state
  const [dash, setDash] = useState<DashboardAnalyticsResponse | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashError, setDashError] = useState<string | null>(null);
  
const scrollRef = useRef<HTMLDivElement>(null)

const scroll = (direction: "left" | "right") => {
  if (!scrollRef.current) return
  const scrollAmount = 300
  scrollRef.current.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  })
}

  const fetchDashboard = async () => {
    try {
      setLoadingDash(true);
      setDashError(null);

      const res = await axios.get("/api/analytics/dashboard", {
        params: { country, region, season, demographic },
        withCredentials: true,
      });

      setDash(res.data);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        router.push("/login"); // adjust to your real login route
        return;
      }

      setDashError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard analytics"
      );
    } finally {
      setLoadingDash(false);
    }
  };

  // ✅ Load analytics whenever filters change
  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, region, season, demographic]);

  // ✅ Use API data if available, otherwise fallback to mock
  const trendData = useMemo(
    () => dash?.charts?.trendData ?? TREND_DATA,
    [dash]
  );
  const regionData = useMemo(
    () => dash?.charts?.regionData ?? REGION_DATA,
    [dash]
  );
  const seasonalData = useMemo(
    () => dash?.charts?.seasonalData ?? SEASONAL_DATA,
    [dash]
  );

  const recentActivity = useMemo(
    () => dash?.recentActivity ?? [],
    [dash]
  );
  const recommendedProducts = useMemo(
    () => dash?.recommendedProducts ?? [],
    [dash]
  );
  const recommendedCompanies = useMemo(
    () => dash?.recommendedCompanies ?? [],
    [dash]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={loadingDash}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <ProfileButton />
          </div>
        </div>

        {dashError && (
          <p className="mt-3 text-sm text-red-600">{dashError}</p>
        )}
      </header>

      <div className="p-6">
        <div className="grid lg:grid-cols-6 gap-6">

        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest business updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDash && recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {activity.content}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}{/**
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button> */}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Products */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Products</CardTitle>
                <CardDescription>Based on your preferences</CardDescription>
              </CardHeader>
              <div className="relative">

                {/* Left arrow */}
                <button
                  onClick={() => scroll("left")}
                  className="    
                    absolute -left-3 top-1/2 -translate-y-1/2
                    z-10 bg-white shadow rounded-full p-2
                    hidden md:flex
                  "
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Scroll container */}
                <CardContent ref={scrollRef}
                  className="
                    flex gap-4
                    overflow-x-auto overflow-y-hidden
                    snap-x snap-mandatory scroll-smooth
                    px-14   /* ⬅️ IMPORTANT: space for arrows */
                    py-2
                    h-[14vh]
                    no-scrollbar
                  "
                >
                  {loadingDash && recommendedProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    recommendedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="
                          snap-start
                          shrink-0
                          flex items-center space-x-3
                          p-3 rounded-lg hover:bg-slate-50
                          w-[75vw] sm:w-[320px] md:w-[260px] lg:w-[240px]
                        "
                      >
                        <img
                          src={`data:image/png;base64,${product.image}` || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.company}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.price && (
                              <Badge variant="secondary" className="text-xs">
                                {product.price}
                              </Badge>
                            )}
                            {product.moq && (
                              <Badge variant="outline" className="text-xs">
                                MOQ: {product.moq}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}{/**
                  <Button variant="outline" className="w-full">
                    View All Products
                  </Button> */}
                </CardContent>
                {/* Right arrow */}
                <button
                  onClick={() => scroll("right")}
                  className="
                      absolute -right-3 top-1/2 -translate-y-1/2
                      z-10 bg-white shadow rounded-full p-2
                      hidden md:flex
                    "
                  >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </Card>
          </div>

          {/* Recommended Companies */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Partners</CardTitle>
                <CardDescription>
                  Companies you might want to connect with
                </CardDescription>
              </CardHeader>              <CardContent className="space-y-4 overflow-y-auto h-[10vh]">
                {loadingDash && recommendedCompanies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  recommendedCompanies.map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {company.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.type} • {company.location}
                        </p>
                        <p className="text-xs text-slate-500">
                          {company.products} products
                        </p>
                      </div>
                    </div>
                  ))
                )}{/**
                <Button variant="outline" className="w-full">
                  View All Partners
                </Button> */}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Clothing Consumer Preference Analytics */}
        <div className="lg:col-span-4 py-1">
          <div className="mb-1">
            <h2 className="text-xl font-bold mb-1">
              Clothing Consumer Preferences
            </h2>
            <p className="text-muted-foreground">
              Analyze trending product types based on region, season, and demographics
            </p>
          </div>

          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-1">
              <TabsTrigger value="trends" className="gap-2">
                <BarChartIcon className="h-4 w-4" />
                Product Trends
              </TabsTrigger>
              <TabsTrigger value="regional" className="gap-2">
                <PieChartIcon className="h-4 w-4" />
                Regional Analysis
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="gap-2">
                <LineChartIcon className="h-4 w-4" />
                Seasonal Patterns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Product Type Trends</CardTitle>
                  <CardDescription>
                    Monthly trends in {country === "all" ? "all countries" : country}
                    {region !== "all" ? `, ${region}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <BarChart
                    data={trendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regional">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Market Distribution</CardTitle>
                  <CardDescription>
                    Market share by region in{" "}
                    {country === "all" ? "all countries" : country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <PieChart
                    data={regionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seasonal">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Product Patterns</CardTitle>
                  <CardDescription>
                    Seasonal trends in {country === "all" ? "all countries" : country}
                    {region !== "all" ? `, ${region}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <LineChart
                    data={seasonalData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
}
