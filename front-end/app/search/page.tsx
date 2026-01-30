"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, Star, MapPin, Package, Users, CheckCircle,
  Bot, User, Sparkles, MessageSquare, Filter, Lightbulb,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useSocket } from "@/context/SocketContext";
import { useBusiness } from "@/context/BusinessContext";
import dynamic from "next/dynamic";

const ProfileButton = dynamic(() => import("@/components/ProfileButton"), {
  ssr: false,
});

// --- Interfaces ---
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  searchResults?: SearchResult[];
  suggestions?: string[];
  filters?: FilterSuggestion[];
  rawData?: any[];
}

interface SearchResult {
  id: string;
  type: "product" | "partner";
  name: string;
  company?: string;
  description: string;
  price?: string;
  moq?: string;
  location: string;
  rating: number;
  verified: boolean;
  image?: string;
  relevanceScore: number;
  tags: string[];
  specialties?: string[];
  employees?: string;
  responseTime?: string;
  products?: number;
}

interface FilterSuggestion {
  label: string;
  action: string;
  value: string;
}

// --- Static Helpers ---
const buildIntro = (role?: string, country?: string) => {
  const isImporter = role === "importer";
  const isManufacturer = role === "manufacturer";

  if (!isImporter && !isManufacturer) {
    return {
      content: "👋 Hi! I'm your AI search assistant. Tell me what you're looking for in natural language!",
      suggestions: ["Find organic cotton suppliers", "Show me sustainable manufacturers", "I need denim products under $20", "Find partners in Indonesia"],
    };
  }

  if (isImporter) {
    const from = country === "indonesia" ? "China" : "Indonesia";
    return {
      content: `👋 Hi! I'm your AI search assistant for importers.\nTell me what products you want to source (material, category, price, MOQ).\n\nFor example:\n• "I need organic cotton t-shirts from ${from} under $15"\n• "Find halal wear suppliers with MOQ 200"`,
      suggestions: ["Organic cotton t-shirts under $15", "MOQ 200 modest wear", "Denim manufacturers fast production", "Sustainable fabric suppliers"],
    };
  }

  const target = country === "china" ? "Indonesia" : "China";
  return {
    content: `👋 Hi! I'm your AI search assistant for manufacturers.\nTell me what kind of buyers/requests you want to match.\n\nFor example:\n• "Find importers in ${target} looking for modest wear"\n• "Show buyer requests for cotton t-shirts, MOQ 300+"`,
    suggestions: [`Importers in ${target} for modest wear`, "Buyer requests: cotton t-shirts MOQ 300+", "Denim buyers under $20", "Sustainable materials requests"],
  };
};

const buildSearchPlaceholder = (role?: string, country?: string) => {
  if (role === "importer") {
    const from = country === "indonesia" ? "China" : "Indonesia";
    return `Ask me... e.g., "Find organic cotton t-shirts from ${from} under $15"`;
  }
  if (role === "manufacturer") {
    const target = country === "china" ? "Indonesia" : "China";
    return `Ask me... e.g., "Find importers in ${target} requesting denim"`;
  }
  return `Ask me anything... e.g., "Find organic cotton requested in Indonesia"`;
};

const responseOpeners = [
  (count: number, q: string) => `I dug through our catalog and found ${count} options for "${q}".`,
  (count: number, q: string) => `Here are ${count} tailored picks for "${q}" based on your profile.`,
  (count: number, q: string) => `I matched ${count} items to "${q}". Sharing the best fits below.`,
];

export default function SearchPage() {
  const { businessId, businessObject } = useBusiness();
  const { socket } = useSocket();
  const isVerified = businessObject?.verified === true;

  // --- State ---
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [displayProduct, setDisplayProduct] = useState(false);
  const [viewProduct, setViewProduct] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const intro = useMemo(() => buildIntro(businessObject?.role, businessObject?.country), [businessObject]);
  const placeholderText = useMemo(() => buildSearchPlaceholder(businessObject?.role, businessObject?.country), [businessObject]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    setMounted(true);
    setMessages([{
      id: "1",
      type: "assistant",
      content: intro.content,
      timestamp: new Date(),
      suggestions: intro.suggestions,
    }]);
  }, [intro]);

  // --- Data Fetching ---
  const fetchRecProducts = async (recommendedRes: any[]) => {
    try {
      const productIds = recommendedRes.map((rec: any) => rec.productId);
      const [res, ratingRes] = await Promise.all([
        axios.post("/api/products/batch", productIds),
        axios.post("/api/feedback/productRating", { productIds }),
      ]);

      const ratings = ratingRes.data.productRatingSummary || [];

      return res.data.map((p: any) => {
        const rec = recommendedRes.find((r: any) => r.productId === p._id);
        const ratingData = ratings.find((r: any) => r._id === p._id);
        return {
          ...p,
          relevanceScore: rec ? Math.round(rec.similarity * 100) : 0,
          rating: ratingData ? ratingData.avgProductRating : 0,
          explanation: rec?.explanation || "Matches your profile preferences.",
        };
      });
    } catch (error) {
      console.error("Error fetching recommended products details:", error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), type: "user", content: inputValue, timestamp: new Date() };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // 1. Call Recommendation API
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content, userId: businessId, userRole: businessObject?.role }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch recommendations");

      let assistantContent = "";
      let products: any[] = [];

      // 2. Handle Irrelevant Query (Layer 1 & 2 Filter)
      if (data.intent === "unknown" || (data.matches && data.matches.length === 0)) {
        assistantContent = data.message || "I'm specialized in apparel sourcing. Please try searching for specific materials or products.";
      } else {
        // 3. Process Valid Results
        products = await fetchRecProducts(data.matches);
        const opener = responseOpeners[Math.floor(Math.random() * responseOpeners.length)](products.length, userMessage.content);
        
        const explainability = products.slice(0, 3).map((p: any, idx: number) => {
          const details = [
            p.relevanceScore ? `${p.relevanceScore}% match` : "",
            p.material ? `material: ${p.material}` : "",
          ].filter(Boolean).join(" • ");
          return `${idx + 1}. ${p.name}${details ? ` (${details})` : ""} — ${p.explanation}`;
        }).join("\n") || "No detailed picks found.";

        assistantContent = `${opener}\n\nWhy these picks:\n${explainability}`;
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        rawData: products,
      }]);

    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: error?.message || "Sorry, I couldn't fetch results. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartChat = (result: any) => {
    setSelectedPartner(result);
    setShowChatModal(true);
    setChatMessage(`Hello, I would like to inquire about:\n\nProduct: ${result.name}\nID: ${result._id}\n\nCould you provide more details?`);
  };

  const handleSendChatMessage = async () => {
    if (!selectedPartner || !chatMessage.trim()) return;
    setIsStartingChat(true);

    try {
      const res = await axios.post("/api/chat/", {
        receiverId: selectedPartner?.businessId?._id,
        content: chatMessage,
        productContext: selectedPartner._id,
      });

      if (socket && res.status === 201) {
        socket.emit("sendMessage", { selectedChat: res.data.conversationId, msg: res.data });
      }

      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: `✅ Chat started with ${selectedPartner.businessId.companyName}! You can continue in your Messages section.`,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsStartingChat(false);
      setShowChatModal(false);
      setChatMessage("");
    }
  };

  // --- Render Sub-components ---
  const renderRawData = (results: any[]) => (
    <div className="space-y-4 mt-4">
      {results.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-800 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-2" /> Products ({results.length})
          </h4>
          <div className="grid gap-3">
            {results.map((product) => (
              <Card key={product._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={product.images?.[0] ? `data:image/png;base64,${product.images[0]}` : "/placeholder.svg"}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-slate-800">{product.name}</h5>
                          <p className="text-sm text-slate-600">{product.businessId?.companyName}</p>
                          <p className="text-xs text-slate-500 mt-1">{product.description}</p>
                        </div>
                        {product.relevanceScore > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs">{product.relevanceScore}% match</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-600 font-medium">${product.priceMin}-${product.priceMax}</span>
                          <span className="text-slate-500">MOQ: {product.moq}</span>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> {product.businessId?.country}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs ml-1">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setViewProduct(product); setDisplayProduct(true); }}>
                      View Details
                    </Button>
                    {isVerified && (
                      <Button size="sm" className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={() => handleStartChat(product)}>
                        <MessageSquare className="h-3 w-3 mr-1" /> Chat
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Search Assistant</h1>
            <p className="text-slate-600">Natural language search powered by AI</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800"><Sparkles className="h-3 w-3 mr-1" /> NLP Powered</Badge>
            <ProfileButton />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {mounted && messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex space-x-3 max-w-4xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.type === "user" ? "bg-blue-500 text-white" : "bg-purple-600 text-white"}>
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.type === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-4 rounded-lg ${message.type === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"}`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.rawData && renderRawData(message.rawData)}
                    <p className="text-xs text-slate-500 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8"><AvatarFallback className="bg-purple-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                  <div className="bg-white border shadow-sm rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4">
            {mounted && (
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder={placeholderText}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="bg-rose-500 hover:bg-rose-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Conversation</DialogTitle>
            <DialogDescription>Send a message to {selectedPartner?.businessId?.companyName} to begin.</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-semibold text-slate-600">
                  {selectedPartner.businessId?.companyName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{selectedPartner.name}</h4>
                  <p className="text-sm text-slate-600">{selectedPartner.businessId?.companyName}</p>
                </div>
              </div>
              <Textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} rows={4} className="resize-none" />
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowChatModal(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleSendChatMessage} disabled={!chatMessage.trim() || isStartingChat} className="flex-1 bg-rose-500">
                  {isStartingChat ? "Sending..." : "Start Chat"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={displayProduct} onOpenChange={setDisplayProduct}>
        <DialogContent className="overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewProduct.name}</DialogTitle>
            <DialogDescription>Product Details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-base">{viewProduct.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Category</p><p className="font-medium">{viewProduct.category || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Material</p><p className="font-medium">{viewProduct.material || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Price</p><p className="font-medium">RM {viewProduct.priceMin} - {viewProduct.priceMax}</p></div>
              <div><p className="text-sm text-muted-foreground">MOQ</p><p className="font-medium">{viewProduct.moq}</p></div>
            </div>
            {viewProduct.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {viewProduct.images.map((img: string, i: number) => (
                  <img key={i} src={`data:image/png;base64,${img}`} className="rounded-lg border object-cover h-32 w-full" alt="product" />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}