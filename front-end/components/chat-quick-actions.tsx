"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, MapPin, CheckCircle, Star, Phone, Video, Calendar } from "lucide-react"

interface ChatQuickActionsProps {
  partner: {
    id: string
    name: string
    company?: string
    location: string
    rating: number
    verified: boolean
    type: "product" | "partner"
    responseTime?: string
    specialties?: string[]
  }
  onChatStart?: (partnerId: string, message: string) => void
}

export default function ChatQuickActions({ partner, onChatStart }: ChatQuickActionsProps) {
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const messageTemplates = [
    {
      title: "Product Inquiry",
      message: `Hi! I'm interested in your ${partner.type === "product" ? "products" : "services"}. Could you provide more details about pricing, MOQ, and lead times?`,
    },
    {
      title: "Partnership Discussion",
      message: `Hello! I'd like to explore a potential business partnership. Could we schedule a call to discuss our requirements and how we might work together?`,
    },
    {
      title: "Catalog Request",
      message: `Hi there! I found your company through the platform and I'm impressed with your offerings. Could you please share your latest product catalog?`,
    },
    {
      title: "Sample Request",
      message: `Hello! I'm interested in your products and would like to request samples. Could you please let me know the process and any associated costs?`,
    },
    {
      title: "Custom Order",
      message: `Hi! I have a specific requirement for a custom order. Could we discuss the details and see if this is something you can accommodate?`,
    },
  ]

  const handleStartChat = () => {
    setShowChatModal(true)
    setChatMessage(messageTemplates[0].message)
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    setIsStartingChat(true)

    // Simulate API call
    setTimeout(() => {
      onChatStart?.(partner.id, chatMessage)
      setIsStartingChat(false)
      setShowChatModal(false)
      setChatMessage("")
    }, 1500)
  }

  const handleTemplateSelect = (template: string) => {
    setChatMessage(template)
    setSelectedTemplate(template)
  }

  return (
    <>
      <Button size="sm" onClick={handleStartChat} className="bg-emerald-600 hover:bg-emerald-700">
        <MessageSquare className="h-3 w-3 mr-1" />
        Start Chat
      </Button>

      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start Conversation</DialogTitle>
            <DialogDescription>Send a message to {partner.name} to begin your business conversation.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Partner Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="font-semibold text-emerald-600 text-sm">
                      {partner.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-800">{partner.name}</h4>
                      {partner.verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    </div>
                    {partner.company && <p className="text-sm text-slate-600">{partner.company}</p>}
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {partner.location}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                        {partner.rating}
                      </span>
                      {partner.responseTime && <span>Response: {partner.responseTime}</span>}
                    </div>
                    {partner.specialties && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {partner.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Templates */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Choose a message template:</label>
              <div className="grid gap-2">
                {messageTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant={selectedTemplate === template.message ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTemplateSelect(template.message)}
                    className="justify-start h-auto p-3 text-left"
                  >
                    <div>
                      <div className="font-medium text-xs">{template.title}</div>
                      <div className="text-xs opacity-70 mt-1">{template.message.slice(0, 80)}...</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customize your message:</label>
              <Textarea
                placeholder="Type your message here..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-slate-500">
                This will start a new conversation that you can continue in your Messages section.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Quick actions after chat starts:</label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Phone className="h-3 w-3 mr-1" />
                  Schedule Call
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Video className="h-3 w-3 mr-1" />
                  Video Meeting
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Calendar className="h-3 w-3 mr-1" />
                  Set Reminder
                </Button>
              </div>
              <p className="text-xs text-slate-500">These options will be available once the chat is started.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowChatModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isStartingChat}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isStartingChat ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Starting Chat...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
