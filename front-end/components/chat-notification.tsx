"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MessageSquare, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ChatNotificationProps {
  partnerName: string
  message: string
  onDismiss: () => void
}

export default function ChatNotification({ partnerName, message, onDismiss }: ChatNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className="w-80 shadow-lg border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-emerald-600 text-white text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Chat Started
                  </Badge>
                </div>
                <h4 className="font-medium text-emerald-800 mt-1">Message sent to {partnerName}</h4>
                <p className="text-sm text-emerald-700 mt-1 line-clamp-2">{message}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <Link href="/chat">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      Go to Messages
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onDismiss, 300)
              }}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
