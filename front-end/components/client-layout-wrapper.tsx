"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Navigation from "@/components/navigation"

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages that should NOT show navigation
  const noNavPaths = ["/", "/auth/login", "/auth/register", "/auth/business-details", "/auth/license-upload", "/auth/survey", "/auth/forgot-password", "/auth/reset-password", "/admin", "/admin/login"]

  const showNavigation = !noNavPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? "lg:ml-64" : ""}>{children}</main>
    </div>
  )
}
