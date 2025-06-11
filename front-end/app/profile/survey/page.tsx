"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Edit, RefreshCw, TrendingUp } from "lucide-react"

export default function SurveyStatusPage() {
  const [surveyCompleted, setSurveyCompleted] = useState(true)
  const [completionDate] = useState("2024-01-20")

  // Mock survey data summary
  const surveyData = {
    companySize: "Medium Business (51-200 employees)",
    businessType: "Manufacturer",
    primaryGoals: ["Find new suppliers/manufacturers", "Expand to new markets", "Improve product quality"],
    productCategories: ["T-Shirts", "Jeans", "Hoodies"],
    materials: ["Organic Cotton", "Recycled Polyester", "Bamboo"],
    priceRange: [10, 50],
    volumeRange: [500, 5000],
  }

  const handleRetakeSurvey = () => {
    // Redirect to survey page
    window.location.href = "/auth/survey"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Business Survey</h1>
            <p className="text-slate-600">Your business profile and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            {surveyCompleted ? (
              <Badge className="bg-emerald-100 text-emerald-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Incomplete</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {surveyCompleted ? (
          <div className="space-y-6">
            {/* Completion Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  Survey Completed
                </CardTitle>
                <CardDescription>
                  Thank you for completing the business survey on {completionDate}. This information helps us provide
                  better recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button onClick={handleRetakeSurvey} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Responses
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Survey Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Company Size:</span>
                    <p className="text-slate-800">{surveyData.companySize}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Business Type:</span>
                    <p className="text-slate-800">{surveyData.businessType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Primary Goals:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {surveyData.primaryGoals.map((goal) => (
                        <Badge key={goal} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Focus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Product Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {surveyData.productCategories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Preferred Materials:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {surveyData.materials.map((material) => (
                        <Badge key={material} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Price Range:</span>
                    <p className="text-slate-800">
                      ${surveyData.priceRange[0]} - ${surveyData.priceRange[1]} per piece
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Volume Range:</span>
                    <p className="text-slate-800">
                      {surveyData.volumeRange[0].toLocaleString()} - {surveyData.volumeRange[1].toLocaleString()} pieces
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact on Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
                  How This Improves Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">AI</span>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-2">Better Search Results</h3>
                    <p className="text-sm text-slate-600">
                      AI search understands your preferences and shows more relevant products and partners.
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800 mb-2">Personalized Dashboard</h3>
                    <p className="text-sm text-slate-600">
                      Your dashboard shows recommendations tailored to your business goals and product focus.
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800 mb-2">Smart Matching</h3>
                    <p className="text-sm text-slate-600">
                      Get matched with partners who align with your business size, goals, and requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Incomplete Survey State */
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Business Survey</CardTitle>
              <CardDescription>
                Help us personalize your experience by completing a quick 2-minute survey about your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="h-2" />
                <p className="text-sm text-slate-600">
                  This survey helps us understand your business needs and provide better recommendations.
                </p>
                <Button onClick={handleRetakeSurvey} className="bg-emerald-600 hover:bg-emerald-700">
                  Start Survey
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
