"use client";

import type React from "react";
import { useBusiness } from "@/context/BusinessContext";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Search, Languages, MoreVertical, Phone, Video, CheckCircle, Clock } from "lucide-react"

export default function ChatPage() {
  const { businessId, companyName } = useBusiness();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock chat data
  const conversations = [
    {
      id: 1,
      name: "Fashion Import Ltd.",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the product details. When can we schedule a call?",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      verified: true,
    },
    {
      id: 2,
      name: "EcoFashion Co.",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "The organic cotton samples look great!",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
      verified: true,
    },
    {
      id: 3,
      name: "Urban Wear Ltd.",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can you provide more details about the denim quality?",
      timestamp: "3 hours ago",
      unread: 1,
      online: true,
      verified: true,
    },
    {
      id: 4,
      name: "Seasonal Styles",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Looking forward to our partnership!",
      timestamp: "1 day ago",
      unread: 0,
      online: false,
      verified: true,
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "them",
      content:
        "Hi! I'm interested in your organic cotton t-shirts. Can you provide more details about the pricing and MOQ?",
      timestamp: "10:30 AM",
      translated: false,
    },
    {
      id: 2,
      sender: "me",
      content:
        "Hello! Thank you for your interest. Our organic cotton t-shirts are priced at $8-12 per piece depending on quantity. The minimum order quantity is 500 pieces.",
      timestamp: "10:32 AM",
      translated: false,
    },
    {
      id: 3,
      sender: "them",
      content: "That sounds reasonable. What about the lead time for production?",
      timestamp: "10:35 AM",
      translated: false,
    },
    {
      id: 4,
      sender: "me",
      content:
        "For an order of 500-1000 pieces, the lead time is typically 2-3 weeks. For larger quantities, it may take 3-4 weeks.",
      timestamp: "10:37 AM",
      translated: false,
    },
    {
      id: 5,
      sender: "them",
      content: "Perfect! Can we schedule a call to discuss the details further?",
      timestamp: "10:40 AM",
      translated: false,
    },
    {
      id: 6,
      sender: "me",
      content: "I'm available tomorrow afternoon. What time works best for you?",
      timestamp: "10:42 AM",
      translated: false,
    },
    {
      id: 7,
      sender: "them",
      content: "Thanks for the product details. When can we schedule a call?",
      timestamp: "10:45 AM",
      translated: false,
    },
  ]

  const currentChat = conversations.find((chat) => chat.id === selectedChat)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log("conversations details", conversationsDetails);
  console.log("messages details", messages);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
            <p className="text-slate-600">Connect with verified business partners</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Business
          </Badge>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-slate-50 ${
                  selectedChat === conversation.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {conversation.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-slate-800 truncate">{conversation.name}</p>
                        {conversation.verified && <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">{conversation.timestamp}</span>
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 truncate mt-1">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={currentChat.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {currentChat.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {currentChat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-semibold text-slate-800">{currentChat.name}</h2>
                      {currentChat.verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="text-sm text-slate-600">{currentChat.online ? "Online" : "Last seen 2 hours ago"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Languages className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === "me" ? "bg-blue-500 text-white" : "bg-white border text-slate-800"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${msg.sender === "me" ? "text-blue-50" : "text-slate-500"}`}>
                          {msg.timestamp}
                        </span>
                        {msg.sender === "me" && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-blue-50" />
                          </div>
                        )}
                      </div>
                      {msg.translated && (
                        <div className="mt-2 pt-2 border-t border-emerald-500">
                          <p className="text-xs text-emerald-100">Translated from Chinese</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Languages className="h-4 w-4" />
                  </Button>
                  <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-slate-500 mt-2">
                  Messages are automatically translated between Bahasa Indonesia and Simplified Chinese
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Select a conversation</h3>
                <p className="text-slate-600">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
