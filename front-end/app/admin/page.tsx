"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminLicensesPage from './licenses/page';
import AdminFeedbackPage from './feedback/page';
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  Ban,
  UserCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import { toastApiError } from "@/lib/toastApiError"

export default function AdminDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLicense, setSelectedLicense] = useState<number | null>(null)

  // Mock data
  const stats = [
    { title: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Pending Licenses", value: "23", change: "+5", icon: FileText, color: "text-yellow-600" },
    { title: "Active Chats", value: "156", change: "+8%", icon: MessageSquare, color: "text-emerald-600" },
    { title: "Monthly Revenue", value: "$45,230", change: "+15%", icon: BarChart3, color: "text-purple-600" },
  ]

  const pendingLicenses = [
    {
      id: 1,
      companyName: "Global Fashion Co.",
      userEmail: "admin@globalfashion.com",
      submittedDate: "2024-01-20",
      documentType: "Business Registration",
      status: "pending",
    },
    {
      id: 2,
      companyName: "Textile Innovations Ltd.",
      userEmail: "contact@textileinnovations.com",
      submittedDate: "2024-01-19",
      documentType: "Manufacturing License",
      status: "pending",
    },
    {
      id: 3,
      companyName: "EcoWear Solutions",
      userEmail: "info@ecowear.com",
      submittedDate: "2024-01-18",
      documentType: "Import License",
      status: "pending",
    },
  ]

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john@globalfashion.com",
      company: "Global Fashion Co.",
      role: "Manufacturer",
      status: "active",
      verified: true,
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@textileinnovations.com",
      company: "Textile Innovations Ltd.",
      role: "Importer",
      status: "active",
      verified: false,
      joinDate: "2024-01-19",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@ecowear.com",
      company: "EcoWear Solutions",
      role: "Manufacturer",
      status: "banned",
      verified: true,
      joinDate: "2024-01-10",
    },
  ]

  const feedback = [
    {
      id: 1,
      user: "John Smith",
      type: "suggestion",
      rating: 4,
      content: "The chat translation feature is great, but could be faster.",
      date: "2024-01-20",
      status: "new",
    },
    {
      id: 2,
      user: "Sarah Chen",
      type: "bug",
      rating: 2,
      content: "Product images are not loading properly on mobile.",
      date: "2024-01-19",
      status: "addressed",
    },
    {
      id: 3,
      user: "Mike Johnson",
      type: "rating",
      rating: 5,
      content: "Excellent platform for connecting with suppliers!",
      date: "2024-01-18",
      status: "new",
    },
  ]

  const handleApproveLicense = (licenseId: number) => {
    console.log("Approving license:", licenseId)
  }

  const handleRejectLicense = (licenseId: number, reason: string) => {
    console.log("Rejecting license:", licenseId, "Reason:", reason)
  }

  const handleBanUser = (userId: number) => {
    console.log("Banning user:", userId)
  }

  const handleUnbanUser = (userId: number) => {
    console.log("Unbanning user:", userId)
  }

  const logout = async () => {
    try {
      await axios.post("/api/admin/logout");
      toast.success("Logged out successful")
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      toastApiError(err);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            {/*<p className="text-slate-600">Manage users, licenses, and platform operations</p>
          */}
            <p className="text-slate-600">Review and manage business license submissions</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={logout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-slate-600 bg-slate-50 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" />
              Log Out
            </Button>
            {/**
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button> */}
            <Badge className="bg-red-100 text-red-800">Admin Access</Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
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

        <AdminLicensesPage />
        {/**
        <Tabs defaultValue="licenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="licenses">License Management</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="licenses" className="space-y-6">
            <Card>
              <CardContent>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardContent>
                <AdminFeedbackPage />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>*/}
      </div>
    </div>
  )
}
