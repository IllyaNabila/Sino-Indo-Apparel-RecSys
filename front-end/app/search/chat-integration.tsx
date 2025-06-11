"use client"

import { useState } from "react"
import ChatNotification from "@/components/chat-notification"

interface ChatIntegrationProps {
  searchResults: any[]
}

export default function ChatIntegration({ searchResults }: ChatIntegrationProps) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      partnerName: string
      message: string
    }>
  >([])

  const handleChatStart = (partnerId: string, message: string) => {
    const partner = searchResults.find((r) => r.id === partnerId)
    if (partner) {
      const notification = {
        id: Date.now().toString(),
        partnerName: partner.name,
        message: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
      }
      setNotifications((prev) => [...prev, notification])
    }
  }

  const handleDismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  return (
    <>
      {/* Notifications */}
      {notifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${1 + index * 6}rem` }} className="fixed right-4 z-50">
          <ChatNotification
            partnerName={notification.partnerName}
            message={notification.message}
            onDismiss={() => handleDismissNotification(notification.id)}
          />
        </div>
      ))}
    </>
  )
}
