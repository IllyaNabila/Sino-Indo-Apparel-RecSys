"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/chart";
import {
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Package,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// Mock data for charts
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
  labels: [
    "North China",
    "East China",
    "South China",
    "West China",
    "Central China",
  ],
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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [season, setSeason] = useState("all");
  const [demographic, setDemographic] = useState("all");

 {/* // Mock data
  const stats = [
    {
      title: "Active Connections",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Product Views",
      value: "1,247",
      change: "+8%",
      icon: Package,
      color: "text-emerald-600",
    },
    {
      title: "Messages",
      value: "18",
      change: "+3",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "$12,450",
      change: "+15%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];*/}

  const recentActivity = [
    {
      type: "message",
      content: "New message from Textile Co.",
      time: "2 min ago",
      status: "new",
    },
    //{ type: "connection", content: "Fashion Import Ltd. viewed your profile", time: "1 hour ago", status: "viewed" },
    {
      type: "product",
      content: "Cotton T-Shirt received 5 new inquiries",
      time: "3 hours ago",
      status: "inquiry",
    },
    {
      type: "license",
      content: "Business license approved",
      time: "1 day ago",
      status: "approved",
    },
  ];

  const recommendedProducts = [
    {
      name: "Organic Cotton Hoodies",
      company: "EcoFashion Co.",
      price: "$15-25",
      moq: "500 pcs",
      image:
        "https://www.chinaecofiber.com/uploads/image/20221026/17/organic-cotton-hoodie-7.jpg?height=100&width=100",
    },
    {
      name: "Denim Jackets",
      company: "Urban Wear Ltd.",
      price: "$20-35",
      moq: "200 pcs",
      image:
        "https://th.bing.com/th/id/R.a0656793ded6d7582b23cfce193fdca6?rik=5T8kJ8HEQtczFA&riu=http%3a%2f%2fimage.sportsmansguide.com%2fadimgs%2fl%2f4%2f47385m2_ts.jpg&ehk=5Lr3HWdZPY5L1JgIgWRqPqADm%2bO7nKx1JBcRRBWDeog%3d&risl=&pid=ImgRaw&r=0?height=100&width=100",
    },
    {
      name: "Summer Dresses",
      company: "Seasonal Styles",
      price: "$12-18",
      moq: "300 pcs",
      image:
        "https://kellyinthecity.s3.amazonaws.com/wp-content/uploads/2023/07/Summer-Dresses-Under-100_6.png?height=100&width=100",
    },
  ];

  const recommendedCompanies = [
    {
      name: "Global Textiles Inc.",
      type: "Manufacturer",
      location: "Indonesia",
      verified: true,
      products: 45,
    },
    {
      name: "Fashion Forward Co.",
      type: "Importer",
      location: "China",
      verified: true,
      products: 32,
    },
    {
      name: "Sustainable Apparel",
      type: "Manufacturer",
      location: "Vietnam",
      verified: true,
      products: 28,
    },
  ];

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
          <div className="flex items-center space-x-4">
            {/**<Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>*/}
            <Link href="/profile">
              <Button variant="outline" size="sm" className="bg-rose-500 hover:bg-rose-600 text-white hover:text-white ">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters 
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search products, companies, or partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="vietnam">Vietnam</SelectItem>
                  <SelectItem value="thailand">Thailand</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>*/}

        {/* Stats Cards 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-emerald-600">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>*/}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest business updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-shrink-0">
                      {activity.status === "new" && (
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      )}
                      {activity.status === "viewed" && (
                        <Users className="h-5 w-5 text-purple-600" />
                      )}
                      {activity.status === "inquiry" && (
                        <Package className="h-5 w-5 text-orange-600" />
                      )}
                      {activity.status === "approved" && (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {activity.content}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Products */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Products</CardTitle>
                <CardDescription>Based on your preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <img
                      src={product.image || "/placeholder.svg"}
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
                        <Badge variant="secondary" className="text-xs">
                          {product.price}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          MOQ: {product.moq}
                        </Badge>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Products
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Companies */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Partners</CardTitle>
                <CardDescription>
                  Companies you might want to connect with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedCompanies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                      <span className="text-rose-500 font-semibold text-sm">
                        {company.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-slate-800">
                          {company.name}
                        </p>
                        {company.verified && (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {company.type} • {company.location}
                      </p>
                      <p className="text-xs text-slate-500">
                        {company.products} products
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Partners
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Clothing Consumer Preference Analytics */}
        <div className="py-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Clothing Consumer Preferences
            </h2>
            <p className="text-muted-foreground">
              Analyze trending product types based on region, season, and
              demographics
            </p>
          </div>

          {/* Filters 
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Refine the analytics data based on your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="indonesia">Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="northChina">North China</SelectItem>
                      <SelectItem value="eastChina">East China</SelectItem>
                      <SelectItem value="southChina">South China</SelectItem>
                      <SelectItem value="westChina">West China</SelectItem>
                      <SelectItem value="centralChina">
                        Central China
                      </SelectItem>
                      <SelectItem value="jakarta">Jakarta</SelectItem>
                      <SelectItem value="westJava">West Java</SelectItem>
                      <SelectItem value="eastJava">East Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Season</label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Demographics</label>
                  <Select value={demographic} onValueChange={setDemographic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select demographic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Demographics</SelectItem>
                      <SelectItem value="youth">Youth (18-24)</SelectItem>
                      <SelectItem value="youngAdult">
                        Young Adult (25-34)
                      </SelectItem>
                      <SelectItem value="adult">Adult (35-44)</SelectItem>
                      <SelectItem value="middleAge">
                        Middle Age (45-54)
                      </SelectItem>
                      <SelectItem value="senior">Senior (55+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>*/}

          {/* Charts */}
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
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
                    Monthly trends of popular product types in{" "}
                    {country === "all" ? "all countries" : country}
                    {region !== "all" ? `, ${region}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <BarChart
                    data={TREND_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Popularity Index",
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Month",
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Product Popularity Over Time",
                        },
                      },
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
                    data={REGION_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                        },
                        title: {
                          display: true,
                          text: "Market Share by Region",
                        },
                      },
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
                    How product popularity changes with seasons in{" "}
                    {country === "all" ? "all countries" : country}
                    {region !== "all" ? `, ${region}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <LineChart
                    data={SEASONAL_DATA}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Popularity Index",
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: "Season",
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Seasonal Product Popularity",
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Trending Products</CardTitle>
                <CardDescription>
                  Most popular products in the selected region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <span>Cotton T-shirts</span>
                    <span className="text-primary font-medium">+24%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Slim-fit Jeans</span>
                    <span className="text-primary font-medium">+18%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Casual Dresses</span>
                    <span className="text-primary font-medium">+15%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Athletic Wear</span>
                    <span className="text-primary font-medium">+12%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Lightweight Jackets</span>
                    <span className="text-primary font-medium">+10%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumer Demographics</CardTitle>
                <CardDescription>Age distribution of consumers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Youth (18-24)</span>
                      <span>28%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "28%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Young Adult (25-34)</span>
                      <span>35%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Adult (35-44)</span>
                      <span>22%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "22%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Middle Age (45-54)</span>
                      <span>10%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Senior (55+)</span>
                      <span>5%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "5%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Insights</CardTitle>
                <CardDescription>
                  Predicted trends for next season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="bg-green-100 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="font-medium">Sustainable Materials</p>
                      <p className="text-sm text-muted-foreground">
                        Growing demand for eco-friendly and recycled fabrics
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="font-medium">Athleisure Expansion</p>
                      <p className="text-sm text-muted-foreground">
                        Continued growth in athletic-inspired casual wear
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-purple-100 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    </div>
                    <div>
                      <p className="font-medium">Traditional Influences</p>
                      <p className="text-sm text-muted-foreground">
                        Rising interest in designs with cultural heritage
                        elements
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
