"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, Building2, Target, Globe, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface SurveyData {
  // Business Information
  companySize: string
  businessType: string
  yearsInBusiness: string
  primaryMarkets: string[]

  // Product Focus
  productCategories: string[]
  materials: string[]
  priceRange: number[]
  volumeRange: number[]

  // Business Goals
  primaryGoals: string[]
  challenges: string[]
  growthPlans: string

  // Platform Usage
  platformExperience: string
  communicationPreference: string
  decisionTimeframe: string
  budgetRange: string
}

export default function SurveyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    companySize: "",
    businessType: "",
    yearsInBusiness: "",
    primaryMarkets: [],
    productCategories: [],
    materials: [],
    priceRange: [10, 50],
    volumeRange: [500, 5000],
    primaryGoals: [],
    challenges: [],
    growthPlans: "",
    platformExperience: "",
    communicationPreference: "",
    decisionTimeframe: "",
    budgetRange: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Survey completed:", surveyData)
    // Here you would typically send the data to your backend
    router.push("/dashboard")
  }

  const handleArrayToggle = (field: keyof SurveyData, value: string) => {
    setSurveyData((prev) => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return surveyData.companySize && surveyData.businessType && surveyData.yearsInBusiness
      case 2:
        return surveyData.productCategories.length > 0 && surveyData.materials.length > 0
      case 3:
        return surveyData.primaryGoals.length > 0 && surveyData.growthPlans
      case 4:
        return surveyData.platformExperience && surveyData.communicationPreference && surveyData.decisionTimeframe
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Tell us about your business</h2>
        <p className="text-slate-600">This helps us understand your company better</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Company Size</Label>
          <RadioGroup
            value={surveyData.companySize}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, companySize: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="startup" id="startup" />
              <Label htmlFor="startup">Startup (1-10 employees)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small">Small Business (11-50 employees)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium Business (51-200 employees)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large">Large Enterprise (200+ employees)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Business Type</Label>
          <RadioGroup
            value={surveyData.businessType}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, businessType: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manufacturer" id="manufacturer" />
              <Label htmlFor="manufacturer">Manufacturer - I produce apparel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="importer" id="importer" />
              <Label htmlFor="importer">Importer/Buyer - I source and buy apparel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Both - I manufacture and import</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trader" id="trader" />
              <Label htmlFor="trader">Trader - I facilitate business between parties</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Years in Business</Label>
          <Select
            value={surveyData.yearsInBusiness}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, yearsInBusiness: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select years in business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Just starting (0-1 years)</SelectItem>
              <SelectItem value="early">Early stage (1-3 years)</SelectItem>
              <SelectItem value="established">Established (3-10 years)</SelectItem>
              <SelectItem value="mature">Mature (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium">Primary Markets (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              "North America",
              "Europe",
              "Asia Pacific",
              "Southeast Asia",
              "Middle East",
              "Africa",
              "South America",
              "Australia",
            ].map((market) => (
              <div key={market} className="flex items-center space-x-2">
                <Checkbox
                  id={market}
                  checked={surveyData.primaryMarkets.includes(market)}
                  onCheckedChange={() => handleArrayToggle("primaryMarkets", market)}
                />
                <Label htmlFor={market} className="text-sm">
                  {market}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Product Focus</h2>
        <p className="text-slate-600">Help us understand what products you work with</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Product Categories (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              "T-Shirts",
              "Jeans",
              "Dresses",
              "Hoodies",
              "Jackets",
              "Shirts",
              "Pants",
              "Skirts",
              "Activewear",
              "Underwear",
              "Accessories",
              "Children's Wear",
            ].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={surveyData.productCategories.includes(category)}
                  onCheckedChange={() => handleArrayToggle("productCategories", category)}
                />
                <Label htmlFor={category} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Preferred Materials (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              "Cotton",
              "Organic Cotton",
              "Polyester",
              "Recycled Polyester",
              "Wool",
              "Silk",
              "Linen",
              "Bamboo",
              "Hemp",
              "Denim",
              "Spandex",
              "Modal",
            ].map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={material}
                  checked={surveyData.materials.includes(material)}
                  onCheckedChange={() => handleArrayToggle("materials", material)}
                />
                <Label htmlFor={material} className="text-sm">
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Typical Price Range per Piece (USD)</Label>
          <div className="mt-4 px-2">
            <Slider
              value={surveyData.priceRange}
              onValueChange={(value) => setSurveyData((prev) => ({ ...prev, priceRange: value }))}
              max={200}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-2">
            <span>${surveyData.priceRange[0]}</span>
            <span>${surveyData.priceRange[1]}</span>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Typical Order Volume (pieces)</Label>
          <div className="mt-4 px-2">
            <Slider
              value={surveyData.volumeRange}
              onValueChange={(value) => setSurveyData((prev) => ({ ...prev, volumeRange: value }))}
              max={50000}
              min={100}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-2">
            <span>{surveyData.volumeRange[0].toLocaleString()} pcs</span>
            <span>{surveyData.volumeRange[1].toLocaleString()} pcs</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <TrendingUp className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Business Goals</h2>
        <p className="text-slate-600">Tell us about your objectives and challenges</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Primary Goals (Select all that apply)</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {[
              "Find new suppliers/manufacturers",
              "Expand to new markets",
              "Reduce production costs",
              "Improve product quality",
              "Increase order volumes",
              "Find sustainable/eco-friendly options",
              "Develop new product lines",
              "Build long-term partnerships",
            ].map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={goal}
                  checked={surveyData.primaryGoals.includes(goal)}
                  onCheckedChange={() => handleArrayToggle("primaryGoals", goal)}
                />
                <Label htmlFor={goal} className="text-sm">
                  {goal}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Current Challenges (Select all that apply)</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {[
              "Finding reliable suppliers",
              "Quality control issues",
              "High minimum order quantities",
              "Long lead times",
              "Communication barriers",
              "Price negotiations",
              "Logistics and shipping",
              "Compliance and certifications",
            ].map((challenge) => (
              <div key={challenge} className="flex items-center space-x-2">
                <Checkbox
                  id={challenge}
                  checked={surveyData.challenges.includes(challenge)}
                  onCheckedChange={() => handleArrayToggle("challenges", challenge)}
                />
                <Label htmlFor={challenge} className="text-sm">
                  {challenge}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Growth Plans</Label>
          <RadioGroup
            value={surveyData.growthPlans}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, growthPlans: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maintain" id="maintain" />
              <Label htmlFor="maintain">Maintain current business level</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate">Moderate growth (10-30% increase)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aggressive" id="aggressive" />
              <Label htmlFor="aggressive">Aggressive growth (30%+ increase)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expansion" id="expansion" />
              <Label htmlFor="expansion">Major expansion into new markets</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Globe className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Platform Preferences</h2>
        <p className="text-slate-600">Help us customize your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Experience with B2B Platforms</Label>
          <RadioGroup
            value={surveyData.platformExperience}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, platformExperience: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner">New to B2B platforms</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="some" id="some" />
              <Label htmlFor="some">Some experience with similar platforms</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="experienced" id="experienced" />
              <Label htmlFor="experienced">Very experienced with B2B platforms</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Preferred Communication Method</Label>
          <RadioGroup
            value={surveyData.communicationPreference}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, communicationPreference: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chat" id="chat" />
              <Label htmlFor="chat">In-platform messaging</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email">Email communication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="phone" />
              <Label htmlFor="phone">Phone calls</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="video" id="video" />
              <Label htmlFor="video">Video meetings</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Decision Making Timeframe</Label>
          <RadioGroup
            value={surveyData.decisionTimeframe}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, decisionTimeframe: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate">Immediate (within days)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="short" />
              <Label htmlFor="short">Short term (1-4 weeks)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium term (1-3 months)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long" id="long" />
              <Label htmlFor="long">Long term (3+ months)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Monthly Budget Range</Label>
          <Select
            value={surveyData.budgetRange}
            onValueChange={(value) => setSurveyData((prev) => ({ ...prev, budgetRange: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-10k">Under $10,000</SelectItem>
              <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
              <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
              <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
              <SelectItem value="over-500k">Over $500,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AB</span>
            </div>
            <CardTitle className="text-2xl">Welcome to ApparelBiz!</CardTitle>
            <CardDescription>
              Complete this quick survey to personalize your experience and get better recommendations
            </CardDescription>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step < currentStep
                      ? "bg-emerald-600 text-white"
                      : step === currentStep
                        ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                >
                  Complete Survey
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-slate-500 hover:text-slate-700"
              >
                Skip for now (you can complete this later)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
