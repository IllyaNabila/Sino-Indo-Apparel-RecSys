import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayoutWrapper from "@/components/client-layout-wrapper" // Declare the variable here
import { BusinessProvider } from "@/context/BusinessContext";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ApparelBiz - Global Apparel Business Platform",
  description: "Connect manufacturers and importers in the global apparel industry",
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  // Check if current page should show navigation
  const shouldShowNavigation = (pathname: string) => {
    const noNavPaths = ["/", "/auth/login", "/auth/register", "/auth/survey", "/auth/forgot-password", "/admin", "/admin/login"]
    return !noNavPaths.includes(pathname)
  }

  // Since we can't use usePathname in server component, we'll use a client component wrapper
  return <NavigationWrapper>{children}</NavigationWrapper>
}

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <BusinessProvider>
            <LayoutContent>{children}</LayoutContent>
          </BusinessProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
