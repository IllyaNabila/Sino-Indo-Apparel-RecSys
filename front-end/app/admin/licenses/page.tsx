"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  FileText,
  Filter,
  AlertTriangle,
  Calendar,
  Building2,
  Mail,
  ArrowUpDown,
} from "lucide-react"
import axios from "axios"

type Business = {
  _id: string,
  companyName: string,
  companyEmail?: string,
  businessType: string,
  registrationNumber: string,
  country: string,
  address: string,
  phoneNumber: string,
  website: string,
  description: string,
  role: string,
  verified: boolean,
  submittedBy: string,
  createdAt: Date,
  updatedAt: Date
}

interface LicenseSubmissionDB {
  _id: string
  filename: string
  mimetype: string
  data: string
  uploadedAt: string
  verificationStatus: "pending" | "approved" | "rejected"
  rejectionReason?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: Date
  updatedAt: Date
  businessId: Business
}

// License submission type
interface LicenseSubmission {
  id: number
  companyName: string
  companyEmail: string
  submissionDate: string
  documentType: string
  status: "pending" | "approved" | "rejected"
  documentUrl: string
  rejectionReason?: string
  approvedDate?: string
  priority: "normal" | "high" | "low"
  notes?: string
  submitterName: string
  businessType: string
  country: string
}

interface LicenseCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminLicensesPage() {
  // Mock data for license submissions
  const [licenseSubmission, setLicenseSubmission] = useState<LicenseSubmission[]>([
    {
      id: 1,
      companyName: "Global Fashion Co.",
      companyEmail: "admin@globalfashion.com",
      submissionDate: "2024-05-28",
      documentType: "Business Registration",
      status: "pending",
      documentUrl: "/placeholder.svg?height=600&width=400",
      priority: "high",
      submitterName: "John Smith",
      businessType: "Manufacturer",
      country: "Indonesia",
    },
    {
      id: 2,
      companyName: "Textile Innovations Ltd.",
      companyEmail: "contact@textileinnovations.com",
      submissionDate: "2024-05-27",
      documentType: "Manufacturing License",
      status: "pending",
      documentUrl: "/placeholder.svg?height=600&width=400",
      priority: "normal",
      submitterName: "Sarah Chen",
      businessType: "Manufacturer",
      country: "China",
    },
    {
      id: 3,
      companyName: "EcoWear Solutions",
      companyEmail: "info@ecowear.com",
      submissionDate: "2024-05-26",
      documentType: "Import License",
      status: "pending",
      documentUrl: "/placeholder.svg?height=600&width=400",
      priority: "low",
      submitterName: "Mike Johnson",
      businessType: "Importer",
      country: "Vietnam",
    },
    {
      id: 4,
      companyName: "Fashion Forward Co.",
      companyEmail: "support@fashionforward.com",
      submissionDate: "2024-05-25",
      documentType: "Business Registration",
      status: "approved",
      documentUrl: "/placeholder.svg?height=600&width=400",
      approvedDate: "2024-05-26",
      priority: "normal",
      submitterName: "Lisa Wong",
      businessType: "Importer",
      country: "Thailand",
    },
    {
      id: 5,
      companyName: "Denim Masters",
      companyEmail: "info@denimmasters.com",
      submissionDate: "2024-05-24",
      documentType: "Manufacturing License",
      status: "rejected",
      documentUrl: "/placeholder.svg?height=600&width=400",
      rejectionReason: "Document is expired. Please submit a current business license.",
      priority: "normal",
      submitterName: "David Kim",
      businessType: "Manufacturer",
      country: "Indonesia",
    },
  ])

  const [licenseSubmissionDB, setLicenseSubmissionDB] = useState<LicenseSubmissionDB[]>([])
  const [verificationStatus, setVerificationStatus] = useState("pending");
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [counts, setCounts] = useState<LicenseCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // State for rejection dialog
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | string | null>(null)

  // State for document preview dialog
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewSubmission, setPreviewSubmission] = useState<LicenseSubmission | LicenseSubmissionDB | null>(null)
  const [previewSubmissionDB, setPreviewSubmissionDB] = useState<LicenseSubmissionDB | null>(null)

 

  // Filter and sort submissions
  const filteredSubmissions = licenseSubmission
    .filter((submission) => {
      // Search filter
      const matchesSearch =
        submission.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.companyEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.submitterName.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter

      // Priority filter
      const matchesPriority = priorityFilter === "all" || submission.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      // Sort by selected criteria
      switch (sortBy) {
        case "date-asc":
          return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()
        case "date-desc":
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
        case "company-asc":
          return a.companyName.localeCompare(b.companyName)
        case "company-desc":
          return b.companyName.localeCompare(a.companyName)
        case "priority-high":
          const priorityOrder = { high: 0, normal: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        default:
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      }
    })

    const filteredSubmissionsDB = licenseSubmissionDB
    .filter((submission) => {
      // Search filter
      const matchesSearch =
        submission.businessId.companyName.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || submission.verificationStatus === statusFilter

      // Priority filter
      //const matchesPriority = priorityFilter === "all" || submission.priority === priorityFilter

      return matchesSearch && matchesStatus //&& matchesPriority
    })
    .sort((a, b) => {
      // Sort by selected criteria
      switch (sortBy) {
        case "date-asc":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case "date-desc":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case "company-asc":
          return a.businessId.companyName.localeCompare(b.businessId.companyName)
        case "company-desc":
          return b.businessId.companyName.localeCompare(a.businessId.companyName)
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
    })

  // Handle approval of a license submission
  const handleApprove = (submissionId: number) => {
    setLicenseSubmission(
      licenseSubmission.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              status: "approved",
              approvedDate: new Date().toISOString().split("T")[0],
            }
          : submission,
      ),
    )
  }

  const handleApproveDB = async (submissionId: string) => {
    setLicenseSubmissionDB(
      licenseSubmissionDB.map((submission) =>
        submission._id === submissionId
          ? {
              ...submission,
              verificationStatus: "approved",
              approvedAt: new Date().toISOString().split("T")[0],
            }
          : submission,
      ),
    )

    try {
      const req = await axios.patch("/api/admin/licenses", {
        licenseId: submissionId,
        verificationStatus: "approved"
      })
      console.log("License approval success:", req.data);
    } catch (error: any) {
      console.error("Failed to approve license:", error.message);
    }
  }

  // Open rejection dialog
  const openRejectionDialog = (submissionId: number | string) => {
    setSelectedSubmissionId(submissionId)
    setRejectionReason("")
    setIsRejectionDialogOpen(true)
  }

  // Handle rejection of a license submission
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required")
      return
    }

    setLicenseSubmission(
      licenseSubmission.map((submission) =>
        submission.id === selectedSubmissionId
          ? {
              ...submission,
              status: "rejected",
              rejectionReason: rejectionReason,
            }
          : submission,
      ),
    )

    setIsRejectionDialogOpen(false)
    setRejectionReason("")
    setSelectedSubmissionId(null)
  }

  const handleRejectDB = async () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required")
      return
    }

    setLicenseSubmissionDB(
      licenseSubmissionDB.map((submission) =>
        submission._id === selectedSubmissionId
          ? {
              ...submission,
              verificationStatus: "rejected",
              rejectionReason: rejectionReason,
            }
          : submission,
      ),
    )

    try {
      const req = await axios.patch("/api/admin/licenses", {
        licenseId: selectedSubmissionId,
        verificationStatus: "rejected",
        rejectionReason
      })
      console.log("Reject successful:", req.data)
    } catch (error: any) {
      console.error("Reject failed:", error.response?.data || error.message);
    }

    setIsRejectionDialogOpen(false)
    setRejectionReason("")
    setSelectedSubmissionId(null)
  }

  // Open document preview dialog
  const openPreviewDialog = (submission: LicenseSubmission | LicenseSubmissionDB ) => {
    setPreviewSubmission(submission)
    setIsPreviewDialogOpen(true)
  }

  const openPreviewDialogDB = (submission:LicenseSubmissionDB ) => {
    setPreviewSubmissionDB(submission)
    setIsPreviewDialogOpen(true)
  }

  // Get counts for each status
  const pendingCount = licenseSubmission.filter((s) => s.status === "pending").length
  const approvedCount = licenseSubmission.filter((s) => s.status === "approved").length
  const rejectedCount = licenseSubmission.filter((s) => s.status === "rejected").length
 
  const pendingCountDB = counts.pending;
  const approvedCountDB = counts.approved;
  const rejectedCountDB = counts.rejected;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
      case "low":
        return <Badge className="bg-slate-100 text-slate-800">Low Priority</Badge>
      default:
        return null
    }
  }

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        console.log(verificationStatus)
        const response = await axios.get(`/api/admin/licenses?status=${verificationStatus}`);
        const licenses = response.data.data;
        const counts = response.data.counts;
        setCounts(counts);
        setLicenseSubmissionDB(licenses);
        console.log(response);
        
      } catch (error: any) {
        console.error("Fetch license failed:", error.response?.data || error.message);
      }
    }
    fetchLicense();
  }, [verificationStatus]);
  
  console.log(licenseSubmissionDB);
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4"> 
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">License Management</h1>
            <p className="text-slate-600">Review and manage business license submissions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {pendingCountDB} Pending
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {approvedCountDB} Approved
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              {rejectedCountDB} Rejected
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs
          defaultValue="pending"
          value={verificationStatus}
          onValueChange={(value) => setVerificationStatus(value)}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingCount}) </TabsTrigger>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by company name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="company-asc">Company (A-Z)</SelectItem>
                  <SelectItem value="company-desc">Company (Z-A)</SelectItem>
                  <SelectItem value="priority-high">Priority (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="pending" className="space-y-6">
            {filteredSubmissionsDB.filter((s) => s.verificationStatus === "pending").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No pending submissions</h3>
                  <p className="text-slate-600">All business license submissions have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissionsDB
                .filter((submission) => submission.verificationStatus === "pending")
                .map((submission) => (
                  <SubmissionCardDB
                    key={submission._id}
                    submission={submission}
                    onApprove={handleApproveDB}
                    onReject={openRejectionDialog}
                    onPreview={openPreviewDialogDB}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {filteredSubmissionsDB.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No submissions found</h3>
                  <p className="text-slate-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissionsDB.map((submission) => (
                <SubmissionCardDB
                  key={submission._id}
                  submission={submission}
                  onApprove={handleApproveDB}
                  onReject={openRejectionDialog}
                  onPreview={openPreviewDialogDB}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            {filteredSubmissionsDB.filter((s) => s.verificationStatus === "approved").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No approved submissions</h3>
                  <p className="text-slate-600">No business licenses have been approved yet.</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissionsDB
                .filter((submission) => submission.verificationStatus === "approved")
                .map((submission) => (
                  <SubmissionCardDB
                    key={submission._id}
                    submission={submission}
                    onApprove={handleApproveDB}
                    onReject={openRejectionDialog}
                    onPreview={openPreviewDialogDB}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            {filteredSubmissionsDB.filter((s) => s.verificationStatus === "rejected").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No rejected submissions</h3>
                  <p className="text-slate-600">No business licenses have been rejected.</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissionsDB
                .filter((submission) => submission.verificationStatus === "rejected")
                .map((submission) => (
                  <SubmissionCardDB
                    key={submission._id}
                    submission={submission}
                    onApprove={handleApproveDB}
                    onReject={openRejectionDialog}
                    onPreview={openPreviewDialogDB}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Business License</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the business owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-right">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className="resize-none"
                required
              />
              {rejectionReason.trim() === "" && <p className="text-sm text-red-500">Rejection reason is required</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectDB}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>License Document Preview</DialogTitle>
            <DialogDescription>
              {previewSubmissionDB?.businessId.companyName} - {previewSubmissionDB?.mimetype}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Company Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="font-medium">{previewSubmissionDB?.businessId.companyName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{previewSubmissionDB?.businessId.companyEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                    <span>Submitted: {previewSubmissionDB?.uploadedAt.split("T")[0]}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Document Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                    <span>{previewSubmissionDB?.mimetype}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="mr-2">{previewSubmissionDB?.businessId.businessType ? previewSubmissionDB?.businessId.businessType.charAt(0).toUpperCase() + previewSubmissionDB?.businessId.businessType.slice(1).toLowerCase() : "N/A"}</Badge>
                    <Badge variant="outline">{previewSubmissionDB?.businessId.country}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 p-2 text-center text-sm text-slate-600">Document Preview</div>
              <div className="flex justify-center p-4 bg-white">
                <img
                  src={previewSubmissionDB ? `data:${previewSubmissionDB?.mimetype};base64,${previewSubmissionDB.data}` : "/placeholder.svg"}
                  alt="License Document"
                  className="max-h-[500px] object-contain"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {previewSubmissionDB?.verificationStatus === "pending" && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPreviewDialogOpen(false)
                    if (previewSubmission) {
                      openRejectionDialog(previewSubmissionDB._id)
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    if (previewSubmission) {
                      handleApproveDB(previewSubmissionDB._id)
                      setIsPreviewDialogOpen(false)
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {/* Status Information */}
            {previewSubmissionDB?.verificationStatus === "approved" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-emerald-800">Approved</h4>
                    <p className="text-sm text-emerald-700">
                      This license was approved on {previewSubmissionDB.verifiedAt?.split("T")[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {previewSubmissionDB?.verificationStatus === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Rejected</h4>
                    <p className="text-sm text-red-700 mt-1">{previewSubmissionDB.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Submission Card Component
interface SubmissionCardProps {
  submission: LicenseSubmission 
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onPreview: (submission: LicenseSubmission) => void
}

interface SubmissionCardPropsDB {
  submission: LicenseSubmissionDB
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onPreview: (submission: LicenseSubmissionDB) => void
}

function SubmissionCard({ submission, onApprove, onReject, onPreview }: SubmissionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h3 className="font-semibold text-slate-800">{submission.companyName}</h3>
                {submission.status === "pending" && getPriorityBadge(submission.priority)}
              </div>
              <div>{getStatusBadge(submission.status)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center text-slate-600">
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                {submission.companyEmail}
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                Submitted: {submission.submissionDate}
              </div>
              <div className="flex items-center text-slate-600">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                {submission.documentType}
              </div>
              <div className="flex items-center text-slate-600">
                <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                {submission.businessType} • {submission.country}
              </div>
            </div>

            {/* Show rejection reason if rejected */}
            {submission.status === "rejected" && (
              <div className="mt-3 p-3 bg-red-50 rounded-md">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{submission.rejectionReason}</p>
              </div>
            )}

            {/* Show approval date if approved */}
            {submission.status === "approved" && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-md">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Approved on:</span> {submission.approvedDate}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onPreview(submission)}>
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Button>

            {submission.status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onApprove(submission.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onReject(submission.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionCardDB({ submission, onApprove, onReject, onPreview }: SubmissionCardPropsDB) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h3 className="font-semibold text-slate-800">{submission.businessId.companyName}</h3>
                {submission.verificationStatus === "pending"}
              </div>
              <div>{getStatusBadge(submission.verificationStatus)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center text-slate-600">
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                {/*{submission.companyEmail}*/}
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                Submitted: {submission.uploadedAt.split("T")[0]}
              </div>
              <div className="flex items-center text-slate-600">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                {submission.mimetype}
              </div>
              <div className="flex items-center text-slate-600">
                <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                {submission.businessId.role} • {submission.businessId.country}
              </div>
            </div>

            {/* Show rejection reason if rejected */}
            {submission.verificationStatus === "rejected" && (
              <div className="mt-3 p-3 bg-red-50 rounded-md">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{submission.rejectionReason}</p>
              </div>
            )}

            {/* Show approval date if approved */}
            {submission.verificationStatus === "approved" && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-md">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Approved on:</span> {submission.verifiedAt?.split("T")[0]}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onPreview(submission)}>
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Button>

            {submission.verificationStatus === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onApprove(submission._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onReject(submission._id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function for status badges
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      )
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

// Helper function for priority badges
function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge className="ml-2 bg-red-100 text-red-800">High Priority</Badge>
    case "normal":
      return <Badge className="ml-2 bg-blue-100 text-blue-800">Normal</Badge>
    case "low":
      return <Badge className="ml-2 bg-slate-100 text-slate-800">Low Priority</Badge>
    default:
      return null
  }
}
