"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Star,
  MapPin,
  Package,
  Users,
  CheckCircle,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Filter,
  Lightbulb,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  searchResults?: SearchResult[]
  suggestions?: string[]
  filters?: FilterSuggestion[]
  rawData?: any[]
}

interface SearchResult {
  id: string
  type: "product" | "partner"
  name: string
  company?: string
  description: string
  price?: string
  moq?: string
  location: string
  rating: number
  verified: boolean
  image?: string
  relevanceScore: number
  tags: string[]
  specialties?: string[]
  employees?: string
  responseTime?: string
  products?: number
}

interface FilterSuggestion {
  label: string
  action: string
  value: string
}

export default function SearchPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        '👋 Hi! I\'m your AI search assistant. I can help you find products, suppliers, or business partners. Just tell me what you\'re looking for in natural language!\n\nFor example, you could say:\n• "I need organic cotton t-shirts from China under $15"\n• "Find me sustainable fabric suppliers in China"\n• "Show me denim manufacturers with fast delivery"',
      timestamp: new Date(),
      suggestions: [
        "Find organic cotton suppliers",
        "Show me sustainable manufacturers",
        "I need denim products under $20",
        "Find partners in Indonesia",
      ],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedPartner, setSelectedPartner] = useState<SearchResult | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [displayProduct, setDisplayProduct] = useState(false)
  const [viewProduct, setViewProduct] = useState(Object)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

const currentUserProfile = {
  preferences: {
    materials: ["Organic Cotton", "Bamboo"],
    category: ["T-Shirts", "Eco Wear"],
    customTags: ["sustainable", "breathable", "GOTS Certified"]
  },
  role: "manufacturer",
  location: "Shanghai, China"
};

    // Mock search results
    const mockProductResults: SearchResult[] = [
    {
      id: "1",
      type: "product",
      name: "Organic Cotton T-Shirts",
      company: "EcoStyle Importers",
      description: "Premium organic cotton t-shirts sourced from verified Chinese manufacturers.",
      price: "$8-15",
      moq: "500 pcs",
      location: "Jakarta, Indonesia",
      rating: 4.8,
      verified: true,
      image: "/placeholder.svg?height=150&width=150",
      relevanceScore: 95,
      tags: ["Organic", "GOTS Certified", "Sustainable"],
    },
    {
      id: "2",
      type: "product",
      name: "Bamboo Fiber T-Shirts",
      company: "TropicalWear Import Co.",
      description: "Eco-friendly bamboo t-shirts sourced from sustainable Chinese suppliers.",
      price: "$10-18",
      moq: "300 pcs",
      location: "Bandung, Indonesia",
      rating: 4.6,
      verified: true,
      image: "/placeholder.svg?height=150&width=150",
      relevanceScore: 88,
      tags: ["Bamboo", "Eco-friendly", "Breathable"],
    },
    {
      id: "3",
      type: "product",
      name: "Traditional Handmade Batik Shirts",
      company: "Batik Nusantara Imports",
      description: "Authentic handmade batik shirts crafted by artisans in Yogyakarta, ideal for cultural fashion collections.",
      price: "$15-25",
      moq: "200 pcs",
      location: "Yogyakarta, Indonesia",
      rating: 4.9,
      verified: true,
      image: "/placeholder.svg?height=150&width=150",
      relevanceScore: 93,
      tags: ["Batik", "Handmade", "Traditional", "Artisan"],
    }
  ];

    const mockPartnerResults: SearchResult[] = [
    {
      id: "1",
      type: "partner",
      name: "Sustainable Textiles China",
      description: "Leading Chinese manufacturer of organic and sustainable apparel",
      location: "Guangzhou, China",
      rating: 4.9,
      verified: true,
      relevanceScore: 94,
      tags: ["Organic", "Sustainable", "GOTS"],
      specialties: ["Organic Cotton", "Bamboo Fiber", "Hemp"],
      employees: "150-200",
      responseTime: "< 2 hours",
      products: 45,
    },
    {
      id: "2",
      type: "partner",
      name: "EcoFashion Manufacturing China",
      description: "Certified Chinese sustainable manufacturer with 15+ years experience",
      location: "Shenzhen, China",
      rating: 4.7,
      verified: true,
      relevanceScore: 89,
      tags: ["Sustainable", "Experienced", "Certified"],
      specialties: ["Organic Materials", "Eco-friendly Dyes"],
      employees: "100-150",
      responseTime: "< 4 hours",
      products: 32,
    },
    {
      id: "3",
      type: "partner",
      name: "Oriental Heritage Textile Co.",
      description: "Chinese textile manufacturer offering batik-style printed fabrics inspired by Southeast Asian designs.",
      location: "Hangzhou, China",
      rating: 4.4,
      verified: true,
      relevanceScore: 85,
      tags: ["Batik", "Printed", "Cultural"],
      specialties: ["Digital Batik Prints", "Roller Printing", "Cotton Blends"],
      employees: "100-120",
      responseTime: "< 3 hours",
      products: 34,
    }
  ];

  const processQuery = async (query: string): Promise<Message> => {
    const products = await getProduct(query);
    return {
      id: Date.now().toString(),
      type: "assistant",
      content: `🔍 I found ${products?.length || 0} results for "${query}". Here's what matches your search:`,
      timestamp: new Date(),
      rawData: products || [],
    }
  }
   
  const processNLPQuery = async (query: string): Promise<Message> => {
    // Simulate NLP processing
    const lowerQuery = query.toLowerCase()

    let searchResults: SearchResult[] = []
    let responseContent = ""
    let suggestions: string[] = []
    let filters: FilterSuggestion[] = []

    // Intent detection and response generation
    if (lowerQuery.includes("organic") || lowerQuery.includes("sustainable") || lowerQuery.includes("eco")) {
      if (lowerQuery.includes("supplier") || lowerQuery.includes("manufacturer") || lowerQuery.includes("partner")) {
        searchResults = mockPartnerResults
        responseContent =
          "🌱 I found sustainable suppliers that match your criteria! These partners specialize in organic and eco-friendly materials."
        suggestions = [
          "Show me their certifications",
          "Filter by location",
          "Find products from these suppliers",
          "Compare their response times",
        ]
      } else {
        searchResults = mockProductResults
        responseContent =
          "🌱 Great! I found some organic and sustainable products for you. These suppliers focus on eco-friendly materials with proper certifications."
        suggestions = [
          "Show me pricing details",
          "Filter by MOQ range",
          "Find similar products",
          "Contact these suppliers",
        ]
      }
      filters = [
        { label: "GOTS Certified only", action: "filter", value: "gots" },
        { label: "Under $15 per piece", action: "filter", value: "price_under_15" },
        { label: "Indonesia only", action: "filter", value: "location_indonesia" },
      ]
    } else if (lowerQuery.includes("denim") || lowerQuery.includes("jeans")) {
      responseContent =
        "👖 Looking for denim products! Let me search for denim manufacturers and products that match your requirements."
      suggestions = [
        "Show premium denim options",
        "Find custom wash services",
        "Filter by fabric weight",
        "Show bulk pricing",
      ]
    } else if (lowerQuery.includes("indonesia") || lowerQuery.includes("jakarta") || lowerQuery.includes("bandung")) {
      if (lowerQuery.includes("supplier") || lowerQuery.includes("manufacturer")) {
        searchResults = mockPartnerResults
        responseContent =
          "🇮🇩 Found Indonesian importers !"
      } else {
        searchResults = mockProductResults
        responseContent =
          "🇮🇩 Here are products requested by Indonesian importer!"
      }
      suggestions = ["Show shipping options", "Compare lead times", "Find certified suppliers", "Get bulk discounts"]
    } else if (lowerQuery.includes("price") || lowerQuery.includes("cheap") || lowerQuery.includes("budget")) {
      responseContent =
        "💰 I'll help you find cost-effective options! Let me search for products within your budget range."
      suggestions = ["Show products under $10", "Find bulk pricing", "Compare MOQ requirements", "Get volume discounts"]
      filters = [
        { label: "Under $10", action: "filter", value: "price_under_10" },
        { label: "Under $20", action: "filter", value: "price_under_20" },
        { label: "Low MOQ (under 500)", action: "filter", value: "moq_low" },
      ]
    } else if (lowerQuery.includes("fast") || lowerQuery.includes("quick") || lowerQuery.includes("urgent")) {
      responseContent =
        "⚡ Looking for fast delivery options! I'll find suppliers with quick turnaround times and responsive communication."
      suggestions = [
        "Show 1-week delivery",
        "Find express shipping",
        "Filter by response time",
        "Show ready stock items",
      ]
      } else if (lowerQuery.includes("indonesia") || lowerQuery.includes("jakarta") || lowerQuery.includes("bandung")) {
        searchResults = mockProductResults
        responseContent = "🇮🇩 These are importer product listings from Indonesia based on your interest."
        suggestions = ["Show MOQ details", "Find matching suppliers in China", "Request quotation", "Contact importer"]
      } else if (lowerQuery.includes("china") || lowerQuery.includes("guangzhou") || lowerQuery.includes("shenzhen")) {
        searchResults = mockPartnerResults
        responseContent = "🇨🇳 Here are verified Chinese manufacturers that match your query."
        suggestions = ["View certifications", "Compare pricing", "Request sample", "View lead time"]
      }else if (lowerQuery.includes("batik")) {
            if (lowerQuery.includes("handmade") || lowerQuery.includes("traditional")) {
              searchResults = mockProductResults.filter(p => p.tags.includes("Handmade"))
              responseContent = "🎨 These are authentic handmade batik product requests from Indonesian importers."
            } else if (lowerQuery.includes("printed") || lowerQuery.includes("manufacturer") || lowerQuery.includes("mass")) {
              searchResults = mockPartnerResults.filter(p => p.tags.includes("Printed"))
              responseContent = "🧵 Here are Chinese manufacturers offering printed batik-style textiles for large orders."
            } else {
              searchResults = [
                ...mockProductResults.filter(p => p.tags.includes("Batik")),
                ...mockPartnerResults.filter(p => p.tags.includes("Batik")),
              ]
              responseContent = "🧶 Here’s a variety of batik-related products and suppliers. Let me know if you prefer handmade or printed!"
            }
            suggestions = ["View handmade batik", "See printed batik fabrics", "Contact suppliers", "Request MOQ details"]
    } else {
      // General search
      searchResults = [...mockProductResults, ...mockPartnerResults]
      responseContent = `🔍 I found ${searchResults.length} results for "${query}". Here's what matches your search:`
      suggestions = ["Refine by product type", "Filter by location", "Show only verified suppliers", "Sort by rating"]
    }

    return {
      id: Date.now().toString(),
      type: "assistant",
      content: responseContent,
      timestamp: new Date(),
      searchResults,
      suggestions,
      filters,
    }
  }
{/**
  const processNLPQuery = async (query: string): Promise<Message> => {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const { intent, entities, message } = await res.json();
  let searchResults: SearchResult[] = [];

  // === Intent-based Routing ===
  if (intent === "find_supplier") {
    searchResults = mockPartnerResults.filter((result) =>
      entities.some((entity: string) =>
        result.description?.toLowerCase().includes(entity.toLowerCase())
      )
    );
  } else if (intent === "find_product" || intent === "compare_price") {
    searchResults = mockProductResults.filter((result) =>
      entities.some((entity: string) =>
        result.name?.toLowerCase().includes(entity.toLowerCase())
      )
    );
  } else {
    // Fallback: show a mix
    searchResults = [...mockProductResults, ...mockPartnerResults];
  }

  return {
    id: Date.now().toString(),
    type: "assistant",
    content: message,
    timestamp: new Date(),
    searchResults,
    suggestions: ["Refine your search", "Filter by location", "Sort by rating"],
    filters: [],
  };
}; */}
{/**
const processNLPQuery = async (query: string): Promise<Message> => {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const { intent, entities } = await response.json();

  let searchResults: SearchResult[] = [];
  let suggestions: string[] = [];
  let filters: FilterSuggestion[] = [];

  // 1. NLP Filtering
  if (entities.length > 0) {
    searchResults = mockProductResults.filter((result) =>
      entities.some((entity: string) =>
        result.name?.toLowerCase().includes(entity.toLowerCase())
      )
    );
  }

  // 2. Profile-Based Fallback
  if (searchResults.length === 0 && currentUserProfile) {
    searchResults = mockProductResults.filter((result) =>
      result.tags.some((tag) =>
        [...currentUserProfile.preferences.materials, ...currentUserProfile.preferences.customTags]
          .map((p) => p.toLowerCase())
          .includes(tag.toLowerCase())
      )
    );
  }

  // 3. Adaptive Fallback
  if (searchResults.length === 0) {
    searchResults = mockProductResults.sort((a, b) => b.rating - a.rating).slice(0, 5);
  }

  return {
    id: Date.now().toString(),
    type: "assistant",
    timestamp: new Date(),
    content: `🤖 Here's what I found for "${query}" (Intent: ${intent})`,
    searchResults,
    suggestions: ["Refine search", "Filter by material", "See top-rated"],
    filters,
  };
};*/}

  const getProduct = async (query: string) =>{
    try {
      const res = await axios.get(`/api/search?material=${query.trim()}`);
        if (res.status === 200) {
          console.log("success")
        }
        console.log("Fetched search results:", res.data);
        const results = Array.isArray(res.data) ? res.data : [];
        return results;
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
        throw new Error("Unable to fetch products right now.")
      }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    
    // Simulate AI processing delay
    try {
      const assistantResponse = await processQuery(inputValue)
      setMessages((prev) => [...prev, assistantResponse])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "assistant",
          timestamp: new Date(),
          content: error?.message ?? "Sorry, I couldn't fetch results. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false)
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartChat = async (result: SearchResult) => {
    setSelectedPartner(result)
    setShowChatModal(true)
    setChatMessage(
      `Hi! I'm interested in your ${result.type === "product" ? result.name : "products and services"}. Could you please provide more details?`,
    )
  }

  const handleSendChatMessage = async () => {
    if (!selectedPartner || !chatMessage.trim()) return

    setIsStartingChat(true)

    // Simulate API call to start chat
    setTimeout(() => {
      console.log("Starting chat with:", selectedPartner.name, "Message:", chatMessage)
      setIsStartingChat(false)
      setShowChatModal(false)
      setChatMessage("")
      setSelectedPartner(null)

      // Add success message to chat
      const successMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `✅ Chat started with ${selectedPartner.name}! Your message has been sent. You can continue the conversation in your Messages section.`,
        timestamp: new Date(),
        suggestions: ["Go to Messages", "Send another message", "Find more suppliers"],
      }
      setMessages((prev) => [...prev, successMessage])
    }, 1500)
  }

  const renderSearchResults = (results: SearchResult[]) => {
    const products = results.filter((r) => r.type === "product")
    const partners = results.filter((r) => r.type === "partner")

    return (
      <div className="space-y-4 mt-4">
        {products.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Products ({products.length})
            </h4>
            <div className="grid gap-3">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-slate-800">{product.name}</h5>
                            <p className="text-sm text-slate-600">{product.company}</p>
                            <p className="text-xs text-slate-500 mt-1">{product.description}</p>
                          </div>
                          <Badge className="bg-blue-500 text-white text-xs">{product.relevanceScore}% match</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-blue-600 font-medium">{product.price}</span>
                            <span className="text-slate-500">MOQ: {product.moq}</span>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.location}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs ml-1">{product.rating}</span>
                            </div>
                            {product.verified && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-rose-500 hover:bg-rose-600"
                        onClick={() => handleStartChat(product)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {partners.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Partners ({partners.length})
            </h4>
            <div className="grid gap-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="font-semibold text-slate-600 text-sm">
                            {partner.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-slate-800">{partner.name}</h5>
                            {partner.verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <p className="text-sm text-slate-600">{partner.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {partner.location}
                            </span>
                            <span>{partner.employees} employees</span>
                            <span>Response: {partner.responseTime}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {partner.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-blue-500 text-white text-xs mb-2">
                          {partner.relevanceScore}% match
                        </Badge>
                        <div className="flex items-center justify-end mb-2">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs ml-1">{partner.rating}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            className="bg-rose-500 hover:bg-rose-600"
                            onClick={() => handleStartChat(partner)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  const renderRawData = (results: any[]) => {
    const products = results ?? [];
    const partners = results.filter((r) => r.type === "partner")

    return (
      <div className="space-y-4 mt-4">
        {products.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Products ({products.length})
            </h4>
            <div className="grid gap-3">
              {products.map((product) => (
                <Card key={product._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/***/}
                      <img
                        src={`data:image/png;base64,${product.images[0]}` || "/placeholder.svg"}
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
                          {/**<Badge className="bg-blue-500 text-white text-xs">{product.relevanceScore}% match</Badge>**/}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-blue-600 font-medium">${product.priceMin}-{product.priceMax}</span>
                            <span className="text-slate-500">MOQ: {product.moq}</span>
                            
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.businessId?.country}
                            </div> 
                          </div>
                          {/**
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs ml-1">{product.rating}</span>
                            </div>
                            {product.verified && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                          </div>
                          */}
                        </div>
                        {/**
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1" 
                      onClick={() => {
                        setViewProduct(product)
                        setDisplayProduct(true)
                      }}>
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-rose-500 hover:bg-rose-600"
                        onClick={() => handleStartChat(product)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/**
        {partners.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Partners ({partners.length})
            </h4>
            <div className="grid gap-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <span className="font-semibold text-slate-600 text-sm">
                            {partner.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-slate-800">{partner.name}</h5>
                            {partner.verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <p className="text-sm text-slate-600">{partner.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {partner.location}
                            </span>
                            <span>{partner.employees} employees</span>
                            <span>Response: {partner.responseTime}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {partner.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-blue-500 text-white text-xs mb-2">
                          {partner.relevanceScore}% match
                        </Badge>
                        <div className="flex items-center justify-end mb-2">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs ml-1">{partner.rating}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            className="bg-rose-500 hover:bg-rose-600"
                            onClick={() => handleStartChat(partner)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Search Assistant</h1>
            <p className="text-slate-600">Natural language search powered by AI</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            <Sparkles className="h-3 w-3 mr-1" />
            NLP Powered
          </Badge>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex space-x-3 max-w-4xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={message.type === "user" ? "bg-blue-500 text-white" : "bg-purple-600 text-white"}
                    >
                      {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.type === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block p-4 rounded-lg ${
                        message.type === "user" ? "bg-blue-500 text-white" : "bg-white border shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Search Results */}
                    {message.searchResults && message.searchResults.length > 0 && (
                      <div className="mt-4">{renderSearchResults(message.searchResults)}</div>
                    )}
                    
                    {/* Search Results */}
                    {message.rawData && message.rawData.length > 0 && (
                      <div className="mt-4">{renderRawData(message.rawData)}</div>
                    )}

                    {/* Filter Suggestions */}
                    {message.filters && message.filters.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Filter className="h-4 w-4 mr-1" />
                          Quick Filters:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.filters.map((filter, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(filter.label)}
                              className="text-xs"
                            >
                              {filter.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions 
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Try asking:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs bg-slate-50 hover:bg-slate-100"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}*/}

                    <p className="text-xs text-slate-500 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border shadow-sm rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Ask me anything... e.g., 'Find organic cotton requested in Indonesia under $15'"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-rose-500 hover:bg-rose-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar 
        <div className="w-80 bg-white border-l p-4 space-y-4">
          <div>
            <h3 className="font-medium text-slate-800 mb-3">Quick Searches</h3>
            <div className="space-y-2">
              {[
                "Organic cotton suppliers",
                "Sustainable manufacturers",
              ].map((query) => (
                <Button
                  key={query}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(query)}
                  className="w-full justify-start text-left h-auto p-2 text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                  {query}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-slate-800 mb-3">Search Examples</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium mb-1">Product Search:</p>
                <p>"I need 1000 organic cotton t-shirts from verified suppliers in Indonesia under $12 per piece"</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium mb-1">Partner Search:</p>
                <p>"Find sustainable manufacturers with GOTS certification and fast response times"</p>
              </div>
            </div>
          </div>
        </div>*/}
      </div>
      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Conversation</DialogTitle>
            <DialogDescription>
              Send a message to {selectedPartner?.name} to begin your business conversation.
            </DialogDescription>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-4">
              {/* Partner Info */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-slate-600 text-sm">
                    {selectedPartner.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{selectedPartner.name}</h4>
                  {selectedPartner.company && <p className="text-sm text-slate-600">{selectedPartner.company}</p>}
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{selectedPartner.location}</span>
                    {selectedPartner.verified && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Your Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  This message will start a new conversation in your Messages section.
                </p>
              </div>

              {/* Quick Message Templates */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quick Templates</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    `Hi! I'm interested in your ${selectedPartner.type === "product" ? selectedPartner.name : "products"}. Could you provide more details about pricing and MOQ?`,
                    `Hello! I'd like to discuss a potential partnership. Can we schedule a call to discuss our requirements?`,
                    `Hi there! I found your ${selectedPartner.type === "product" ? "product" : "company"} through the platform. Could you share your product catalog?`,
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatMessage(template)}
                      className="text-left h-auto p-2 text-xs justify-start"
                    >
                      {template.slice(0, 60)}...
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowChatModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim() || isStartingChat}
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                >
                  {isStartingChat ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Start Chat
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={displayProduct} onOpenChange={setDisplayProduct}>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
        {viewProduct.name || "Unnamed Product"}
            </DialogTitle>
            <DialogDescription>
              View detailed product information below.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="space-y-4 mt-2 overflow-y-auto max-h-[60vh]">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-base">{viewProduct.description || "-"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{viewProduct.category || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Material</p>
                <p className="font-medium">{viewProduct.material || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MOQ</p>
                <p className="font-medium">{viewProduct.moq || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="font-medium">{viewProduct.leadTime || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price Min</p>
                <p className="font-medium">RM {viewProduct.priceMin || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Max</p>
                <p className="font-medium">RM {viewProduct.priceMax || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Colors</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {viewProduct.colors?.length > 0 ? (
                  viewProduct.colors.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-sm rounded bg-gray-100"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No colors specified</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Sizes</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {viewProduct.sizes?.length > 0 ? (
                  viewProduct.sizes.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-sm rounded bg-gray-100"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No sizes specified</p>
                )}
              </div>
            </div>

            {/* Images */}
            {viewProduct.images?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {viewProduct.images.map((img: string | File, i: number) => (
                    <img
                      key={i}
                      src={typeof img === "string" ? `data:image/png;base64,${img}` : URL.createObjectURL(img)}
                      alt={`Product image ${i + 1}`}
                      className="rounded-lg border object-cover h-32 w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
