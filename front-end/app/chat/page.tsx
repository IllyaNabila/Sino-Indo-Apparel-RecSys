"use client";

import type React from "react";
import { useBusiness } from "@/context/BusinessContext";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Search,
  Languages,
  MoreVertical,
  Phone,
  Video,
  CheckCircle,
  Clock,
  MessageCircleOff,
  Package,
} from "lucide-react";
import axios from "axios";
//import { socket } from "@/lib/socket";
import { useSocket } from "@/context/SocketContext";
import { ChatMessageContent } from "@/app/chat/ChatMessageContent";
import { FeedbackForm } from "@/app/chat/FeedbackForm";
import { CompanyProfileModal } from "@/app/chat/CompanyProfileModal";
import dynamic from "next/dynamic";

// Dynamically import the ProfileButton with SSR turned off
const ProfileButton = dynamic(() => import("@/components/ProfileButton"), {
  ssr: false,
});

type ConversationUI = {
  id: string;
  partnerId: string;
  name: string;
  lastMessage: string;
  lastMessageSender: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isEnded?: boolean; // Add this
  productContext?: string | null; // And this
  feedbackForm?: string | null;
};

type MessagesUI = {
  id: string;
  sender: string;
  receiverId: string;
  content: string;
  original?: string;
  translatedText?: string;
  sourceLang?: string;
  targetLang?: string;
  timestamp: string;
};

export default function ChatPage() {
  const { businessId, companyName, businessObject } = useBusiness();
  const { socket, unreadCounts, setUnreadCounts, selectedChat, setSelectedChat } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  //const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationsDetails, setConversationsDetails] = useState<any[]>([]);
  const [endedConversations, setEndedConversations] = useState<Record<string, boolean>>({});
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [productContexts, setProductContexts] = useState<Record<string, string | null>>({});

  const viewerLang = businessObject?.preferredLanguage || "en";

  function generateObjectId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    return (
      timestamp +
      "xxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
        ((Math.random() * 16) | 0).toString(16)
      )
    ).substring(0, 24);
  }

  const toConversationUI = (c: any): ConversationUI => ({
    id: c._id ?? "",
    partnerId: c.partner?._id ?? "",
    name: c.partner?.companyName ?? "",
    lastMessage: c.lastMessageId?.content ?? "",
    lastMessageSender: c.lastMessageId?.senderId ?? "",
    timestamp: new Date(c.lastMessageAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: unreadCounts[c._id] ?? 0,
    online: true,
    isEnded: c.isEnded ?? false, // Add this
    productContext: c.productContext ?? "", // And this
    feedbackForm: c.feedbackForm ?? "completed",
  });

  const toMessageUI = (m: any): MessagesUI => {
    const original = m.text?.original ?? m.content ?? "";
    const translations = m.text?.translations ?? {};
    const translatedText = translations[viewerLang];

    return {
      id: m.id ?? m._id ?? generateObjectId(),
      sender:
        typeof m.senderId === "object"
          ? m.senderId._id
          : m.senderId ?? m.sender ?? "",
      receiverId: m.receiverId ?? "",
      content: translatedText ?? original,
      timestamp: new Date(m.createdAt ?? m.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      original,
      translatedText,
      sourceLang: m.text?.sourceLang,
      targetLang: translatedText ? viewerLang : undefined,
    };
  };

  const fetchConversation = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      const mapped = data.map(toConversationUI);
      setConversationsDetails(mapped);
      console.log(data)
    } catch (error: any) {
      console.error("Error loading conversation:", error);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [unreadCounts]);

  useEffect(() => {
    if (!selectedChat) return;
    if (socket) {
      socket.emit("joinConversation", selectedChat);
    }
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/chat/${selectedChat}/messages`);
        const mapped = data.map(toMessageUI);
        setMessages(mapped);
      } catch (error: any) {
        console.error("Error loading messages:", error);
      }
    };
    fetchMessages();
  }, [unreadCounts]);

  // Effect to check for new product context and reset conversation state
  {/**useEffect(() => {
    if (!selectedChat) return;

    const productIdRegex = /Product ID: ([a-fA-F0-9]{24})/;
    const lastMessage = messages[messages.length - 1];
    const match = lastMessage?.content.match(productIdRegex);
    const currentProductContext = productContexts[selectedChat];

    if (match && match[1] && match[1] !== currentProductContext) {
      // New product detected, re-enable this conversation
      setProductContexts(prev => ({ ...prev, [selectedChat]: match[1] }));
      setEndedConversations(prev => ({ ...prev, [selectedChat]: false }));
    }
  }, [messages, selectedChat, productContexts]);*/}

  useEffect(() => {
    const handleReceiveMessage = (data: any) => {
      console.log("data", data);
      console.log(data.msg.sender === businessId.toString());
      console.log("data.msg.sender", data.msg.sender);
      console.log("businessId", businessId);
      console.log("data.selectedChat", data.selectedChat);
      console.log("Selected Chat:", selectedChat);
      console.log("date:", data.msg.timestamp);
      // Check if the message is from the current user
      if (data.msg.sender === businessId.toString()) return;

      // Update the conversations list with the new message
      setConversationsDetails((prev) =>
        prev.map((conversation) =>
          conversation.id === data.selectedChat
            ? {
                ...conversation,
                lastMessage: data.msg.content,
                lastMessageSender: data.msg.sender,
                unread: conversation.id === selectedChat ? 0 : conversation.unread + 1, // Increment unread count if not the selected chat
              }
            : conversation
        )
      );

      // If the message belongs to the currently selected chat, add it to the messages list
      if (data.selectedChat === selectedChat) {
        const uiMsg = toMessageUI(data.msg);
        setMessages((prev) => [...prev, uiMsg]);
        setUnreadCounts((prev) => ({
          ...prev,
          [data.selectedChat]: 0,
        }));
      }

      console.log("unread Counts:", unreadCounts);
    };

    if (socket) {
      socket.on("receiveMessage", handleReceiveMessage);
    }
    return () => {
      if (socket) {
        socket.off("receiveMessage", handleReceiveMessage);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    console.log("Selected Chat:", selectedChat);
  }, [selectedChat, socket]);

  // Mock chat data
  const mockConversations = [
    {
      id: 1,
      name: "Fashion Import Ltd.",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage:
        "Thanks for the product details. When can we schedule a call?",
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
  ];

  const currentChat = conversationsDetails.find(
    (chat) => chat.id === selectedChat
  );

  const isCurrentConversationEnded = currentChat?.isEnded ?? false;
console.log(currentChat)
  const handleEndConversation = async () => {
    if (selectedChat) {
      console.log(selectedChat)
      try {
        const response = await axios.patch(`/api/chat?conversationId=${selectedChat}`, {
          isEnded: true,
          feedbackForm: "awaiting_rating"
        });
        if (response.status == 200) {
          setConversationsDetails(prev => prev.map(c => 
            c.id === selectedChat ? {...c,
          feedbackForm: "awaiting_rating", isEnded: true} : c
          ));
        }
      } catch (error: any) {
        console.error("Failed to end the conversation:", error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    const msg: MessagesUI = {
      id: generateObjectId(),
      sender: businessId,
      receiverId: currentChat.partnerId,
      content: message,
      original: message,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, msg]);
    setMessage("");

    try {
      const response = await axios.post(`/api/chat/${selectedChat}/messages`, {
        receiverId: currentChat.partnerId,
        content: message,
      });
      const msg = toMessageUI(response.data);
      console.log("msg", msg);
      if (socket) {
        socket.emit("sendMessage", { selectedChat, msg });
      }
      fetchConversation();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectChat = (conversationId: any) => {
    setSelectedChat(conversationId);
    console.log("Selected Chat:", selectedChat);
    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));
  };

  const filteredConversations = conversationsDetails.filter((conv) =>
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
            <p className="text-slate-600">
              Connect with verified business partners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified Business
            </Badge>
            <ProfileButton/>
          </div>
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
                onClick={() => {
                  handleSelectChat(conversation.id); // Set the selected chat
                  setConversationsDetails((prev) =>
                    prev.map((conv) =>
                      conv.id === conversation.id
                        ? { ...conv, unread: 0 } // Reset unread count for the selected conversation
                        : conv
                    )
                  );
                }}
                className={`p-4 border-b cursor-pointer hover:bg-slate-50 ${
                  selectedChat === conversation.id
                    ? "bg-blue-50 border-r-2 border-r-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {/* */}
                    <Avatar>
                      <AvatarImage
                        src={conversation.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {conversation.name
                          .split(" ")
                          .map((word: string) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>{/**
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                    )}*/}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-slate-800 truncate">
                          {conversation.name}
                        </p>
                        {/*{conversation.verified && (
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        )}*/}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">
                          {conversation.timestamp}
                        </span>
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 truncate mt-1">
                      {`${
                        conversation.lastMessageSender === businessId
                          ? "You:"
                          : ""
                      } ${conversation.lastMessage}`}
                    </p>
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
                    {/**/}
                    <Avatar>
                      <AvatarImage
                        src={currentChat.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {currentChat.name
                          .split(" ")
                          .map((word: string) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>{/** 
                    {currentChat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
                    )}*/}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2
                        className="font-semibold text-slate-800 cursor-pointer hover:underline"
                        onClick={() => setIsCompanyModalOpen(true)}
                      >
                        {currentChat.name}
                      </h2>
                      {currentChat.verified && (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    {/*<p className="text-sm text-slate-600">
                      {currentChat.online ? "Online" : "Last seen 2 hours ago"}
                    </p>*/}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleEndConversation} disabled={isCurrentConversationEnded}>
                  <MessageCircleOff className="h-4 w-4 mr-2" /> End Conversation
                </Button>
                {/**
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
                </div> */}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === businessId.toString()
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === businessId.toString()
                          ? "bg-blue-500 text-white"
                          : "bg-white border text-slate-800"
                      }`}
                    >
                      <ChatMessageContent
                        content={msg.content}
                        original={msg.original}
                        translatedText={msg.translatedText}
                        sourceLang={msg.sourceLang}
                        targetLang={msg.targetLang}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs ${
                            msg.sender === businessId.toString()
                              ? "text-blue-50"
                              : "text-slate-500"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                        {msg.sender === businessId.toString() && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-blue-50" />
                          </div>
                        )}
                      </div>
                      {msg.translatedText && msg.original && msg.translatedText !== msg.original && (
                        <div className="mt-2 pt-2 border-t border-emerald-500">
                          <p
                            className={`text-xs ${
                              msg.sender === businessId.toString()
                                ? "text-emerald-100"
                                : "text-emerald-700"
                            }`}
                          >
                            Translated from {msg.sourceLang?.toUpperCase?.() || "source"} to{" "}
                            {msg.targetLang?.toUpperCase?.() || "target"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              {isCurrentConversationEnded ? (
                <div className="p-4 border-t bg-white">
                  <FeedbackForm
                    partnerName={currentChat.name}
                    conversationId={currentChat.id}
                    feedbackForm={currentChat.feedbackForm}
                    productContext={currentChat.productContext}
                  />
                </div>
              ) : (
                /* Message Input */
                <div className="bg-white border-t p-4">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full"
                        disabled={isCurrentConversationEnded}
                      />
                    </div>
                    {/**
                    <Button variant="outline" size="sm" disabled={isCurrentConversationEnded}>
                      <Languages className="h-4 w-4" />
                    </Button> */}
                    <Button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600"
                      disabled={isCurrentConversationEnded}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-slate-500 mt-2">
                    Messages are automatically translated between Bahasa Indonesia and Simplified Chinese
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Select a conversation
                </h3>
                <p className="text-slate-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
        <CompanyProfileModal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          businessId={currentChat?.partnerId || null}
        />
      </div>
    </div>
  );
}
