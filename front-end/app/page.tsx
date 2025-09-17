import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, MessageSquare, Search, BarChart3, Users, Globe } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SIAM</span>
            </div>
            <span className="font-bold text-xl text-slate-800">Sino-Indo Apparel Matcher</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-rose-500 hover:bg-rose-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-rose-100 text-rose-800 hover:bg-rose-100">
            Verified. Matched. Connected.
          </Badge>
          <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Bridging Cultures in the
            <span className="text-rose-500"> Apparel Industry</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Match with verified apparel partners, discover culturally-relevant products, and grow your cross-border business through AI-powered recommendations tailored for the China–Indonesia trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section 
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything You Need to Succeed</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for apparel businesses to connect, communicate, and grow
              together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Verified Business Network</CardTitle>
                <CardDescription>
                  Connect with verified manufacturers and importers through our secure business license verification
                  system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  AI-powered search and recommendations help you find the perfect partners and products based on your
                  preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Real-time Communication</CardTitle>
                <CardDescription>
                  Chat with partners in real-time with built-in translation between Bahasa Indonesia and Simplified
                  Chinese.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Track your business performance with comprehensive analytics and insights tailored to your needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Showcase your products with detailed catalogs including materials, MOQ, pricing, and high-quality
                  images.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Global Reach</CardTitle>
                <CardDescription>
                  Expand your business globally with tools designed for international apparel trade and collaboration.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>*/}

      {/* CTA Section 
      <section className="py-16 px-4 bg-emerald-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Apparel Business?</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of manufacturers and importers who are already growing their business with ApparelBiz.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-50">
              Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>*/}

      {/* Footer 
      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AB</span>
                </div>
                <span className="font-bold text-xl">ApparelBiz</span>
              </div>
              <p className="text-slate-400">
                Connecting the global apparel industry through technology and innovation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Documentation</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ApparelBiz. All rights reserved.</p>
          </div>
        </div>
      </footer>*/}
    </div>
  )
}
