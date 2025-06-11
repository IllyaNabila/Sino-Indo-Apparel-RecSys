"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle } from "lucide-react"

interface SurveyProgressProps {
  currentStep: number
  totalSteps: number
  stepTitles: string[]
}

export default function SurveyProgress({ currentStep, totalSteps, stepTitles }: SurveyProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />

        <div className="flex justify-between">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={`text-xs text-center ${isCurrent ? "text-emerald-600 font-medium" : "text-slate-500"}`}
                >
                  {title}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
