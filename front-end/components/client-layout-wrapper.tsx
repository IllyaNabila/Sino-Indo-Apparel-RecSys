"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { usePathname } from "next/navigation"
import Navigation from "@/components/navigation"
import { useBusiness } from "@/context/BusinessContext"

const USER_NAV_PREFIXES = [
  "/dashboard",
  "/search",
  "/products",
  "/chat",
  "/profile",
  "/feedback",
]

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { businessId } = useBusiness()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isUserRoute = USER_NAV_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )

  const showNavigation = isUserRoute && (!mounted || Boolean(businessId))

  return (
    <div className="min-h-screen bg-slate-50">
      {showNavigation && <Navigation />}
      <main className={showNavigation ? "lg:ml-64" : ""}>{children}</main>
    </div>
  )
}

