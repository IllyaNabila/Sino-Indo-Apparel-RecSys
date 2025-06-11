"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Star,
  Search,
  Reply,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Send,
  Eye,
  Archive,
  Flag,
  Calendar,
  User,
  Tag,
} from "lucide-react"

interface Feedback {
  id: number
  user: string
  userEmail: string
  type: "bug" | "suggestion" | "rating" | "complaint"
  subject: string
  content: string
  rating: number
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "new" | "under_review" | "addressed" | "closed"
  date: string
  adminResponse?: string
  adminResponseDate?: string
  adminName?: string
  attachments?: string[]
  tags?: string[]
}

export default function AdminFeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [responseText, setResponseText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)

  // Mock feedback data
  const feedbackData: Feedback[] = [
    {
      id: 1,
      user: "John Smith",
      userEmail: "john@globalfashion.com",
      type: "suggestion",
      subject: "Improve chat translation speed",
      content:
        "The translation feature is great but could be faster for real-time conversations. Sometimes there's a 3-4 second delay which makes conversations feel unnatural. Could you optimize this?",
      rating: 4,
      category: "chat",
      priority: "medium",
      status: "under_review",
      date: "2024-01-20",
      tags: ["translation", "performance"],
    },
    {
      id: 2,
      user: "Sarah Chen",
      userEmail: "sarah@textileinnovations.com",
      type: "bug",
      subject: "Product images not loading on mobile",
      content:
        "When browsing products on mobile Safari, images take too long to load or don't load at all. This happens consistently on iPhone 14 Pro with iOS 17.2. Desktop works fine.",
      rating: 2,
      category: "mobile",
      priority: "high",
      status: "addressed",
      date: "2024-01-18",
      adminResponse:
        "Thank you for reporting this issue. We've identified the problem with our mobile image optimization and have deployed a fix. Please try again and let us know if you still experience issues.",
      adminResponseDate: "2024-01-19",
      adminName: "Admin Team",
      tags: ["mobile", "images", "ios"],
    },
    {
      id: 3,
      user: "Mike Johnson",
      userEmail: "mike@ecowear.com",
      type: "rating",
      subject: "Excellent platform overall",
      content:
        "Really impressed with the quality of suppliers and the verification process. The search functionality is intuitive and the chat system works well. Keep up the great work!",
      rating: 5,
      category: "general",
      priority: "low",
      status: "addressed",
      date: "2024-01-15",
      adminResponse:
        "Thank you for your positive feedback! We're glad you're having a great experience with our platform.",
      adminResponseDate: "2024-01-16",
      adminName: "Admin Team",
      tags: ["positive", "suppliers"],
    },
    {
      id: 4,
      user: "Lisa Wang",
      userEmail: "lisa@fashionforward.com",
      type: "complaint",
      subject: "Verification process too slow",
      content:
        "I submitted my business documents for verification 2 weeks ago and still haven't heard back. This is blocking my ability to connect with suppliers. Please expedite the process.",
      rating: 1,
      category: "verification",
      priority: "urgent",
      status: "new",
      date: "2024-01-22",
      tags: ["verification", "urgent"],
    },
    {
      id: 5,
      user: "David Brown",
      userEmail: "david@sustainablefashion.com",
      type: "suggestion",
      subject: "Add sustainability filters",
      content:
        "It would be great to have filters for sustainable materials and eco-friendly suppliers. This is becoming increasingly important for our business.",
      rating: 4,
      category: "search",
      priority: "medium",
      status: "new",
      date: "2024-01-21",
      tags: ["sustainability", "filters"],
    },
  ]

  const filteredFeedback = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter
    const matchesType = typeFilter === "all" || feedback.type === typeFilter
    const matchesPriority = priorityFilter === "all" || feedback.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const handleStatusChange = (feedbackId: number, newStatus: string) => {
    console.log(`Changing feedback ${feedbackId} status to ${newStatus}`)
    // Update feedback status in your data store
  }

  const handleSendResponse = () => {
    if (selectedFeedback && responseText.trim()) {
      console.log(`Sending response to feedback ${selectedFeedback.id}:`, responseText)
      // Send response and update feedback status
      setResponseText("")
      setIsResponseDialogOpen(false)
      setSelectedFeedback(null)
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing bulk action ${action} on items:`, selectedItems)
    setSelectedItems([])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "addressed":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "suggestion":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "rating":
        return <Star className="h-4 w-4 text-yellow-600" />
      case "complaint":
        return <Flag className="h-4 w-4 text-red-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Feedback</h1>
            <p className="text-slate-600">Review and respond to user feedback</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">
              {filteredFeedback.filter((f) => f.status === "new").length} New
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              {filteredFeedback.filter((f) => f.status === "under_review").length} Under Review
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="addressed">Addressed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Reports</SelectItem>
                  <SelectItem value="suggestion">Suggestions</SelectItem>
                  <SelectItem value="rating">Ratings</SelectItem>
                  <SelectItem value="complaint">Complaints</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">{selectedItems.length} item(s) selected</span>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("mark_reviewed")}>
                  Mark as Reviewed
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("mark_addressed")}>
                  Mark as Addressed
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("archive")}>
                  Archive
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedItems.includes(feedback.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, feedback.id])
                      } else {
                        setSelectedItems(selectedItems.filter((id) => id !== feedback.id))
                      }
                    }}
                  />

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(feedback.type)}
                        <div>
                          <h3 className="font-semibold text-slate-800">{feedback.subject}</h3>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <User className="h-3 w-3" />
                            <span>{feedback.user}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{feedback.date}</span>
                            <span>•</span>
                            <span>{feedback.userEmail}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(feedback.priority)}>{feedback.priority}</Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          {feedback.status === "new" && <Clock className="h-3 w-3 mr-1" />}
                          {feedback.status === "addressed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {feedback.status.replace("_", " ")}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFeedback(feedback)
                                setIsResponseDialogOpen(true)
                              }}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Respond
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(feedback.id, "under_review")}>
                              <Eye className="h-4 w-4 mr-2" />
                              Mark as Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(feedback.id, "addressed")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Addressed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(feedback.id, "closed")}>
                              <Archive className="h-4 w-4 mr-2" />
                              Close
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-slate-700">{feedback.content}</p>

                    {/* Rating */}
                    {feedback.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-slate-600">Rating:</span>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? "text-yellow-400 fill-current" : "text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-slate-600">({feedback.rating}/5)</span>
                      </div>
                    )}

                    {/* Tags */}
                    {feedback.tags && feedback.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <div className="flex space-x-1">
                          {feedback.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Response */}
                    {feedback.adminResponse && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800">Admin Response</span>
                          <span className="text-xs text-emerald-600">
                            {feedback.adminResponseDate} by {feedback.adminName}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-700">{feedback.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredFeedback.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No feedback found</h3>
                <p className="text-slate-600">Try adjusting your filters or search terms</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Respond to Feedback</DialogTitle>
              <DialogDescription>
                {selectedFeedback && (
                  <>
                    Responding to "{selectedFeedback.subject}" by {selectedFeedback.user}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedFeedback && (
              <div className="space-y-4">
                {/* Original Feedback */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">Original Feedback:</h4>
                  <p className="text-slate-700 text-sm">{selectedFeedback.content}</p>
                </div>

                {/* Response Form */}
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Status Change */}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select defaultValue={selectedFeedback.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="addressed">Addressed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!responseText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
