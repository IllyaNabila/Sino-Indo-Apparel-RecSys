"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building2,
  Target,
  Globe,
  TrendingUp,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useBusiness } from "@/context/BusinessContext";
import {
  CHINA_PRIMARY_MARKETS,
  INDONESIA_PRIMARY_MARKETS,
  APPAREL_CATEGORIES,
  APPAREL_MATERIALS,
} from "@/constants";

interface SurveyData {
  // Business Information
  companySize: string;

  // Product Focus // only this
  primaryMarkets: string[];
  productCategories: string[];
  materials: string[];
  priceRange: number[];
  volumeRange: number[];
  customPreferences: string[];
  seasonPreferences: string[];
}

export default function SurveyPage() {
  const { businessObject } = useBusiness();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [surveyData, setSurveyData] = useState<SurveyData>({
    companySize: "",
    primaryMarkets: [],
    productCategories: [],
    materials: [],
    priceRange: [],
    volumeRange: [],
    customPreferences: [],
    seasonPreferences: [],
  });
  const [mounted, setMounted] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toCheckboxId = (prefix: string, value: string) =>
    `${prefix}-${value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}`;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log(surveyData)
      const response = await axios.post("/api/users/survey", {
        surveyData,
        customTags
      });
      console.log("Saved:", response.data);
      router.push("/dashboard");
    } catch (error: any) {
      console.error(
        "Error submitting preferences:",
        error.response?.data || error.message
      );
    }
  };

  const handleArrayToggle = (field: keyof SurveyData, value: string) => {
    setSurveyData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Market Focus</h2>
        <p className="text-slate-600">
          This helps us understand your region of interest
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-2">
            Primary Markets (Select all that apply)
          </Label>
          {!mounted ? <p className="text-sm text-gray-500">Loading…</p> : businessObject?.country === "indonesia" ? (
            <div className="mt-4">
              <Label className="text-sm font-semibold text-gray-700">China</Label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {CHINA_PRIMARY_MARKETS.map((market) => {
                  const id = toCheckboxId("primaryMarket", market.value);
                  const selected = (surveyData?.primaryMarkets ?? []).includes(market.value);

                  return (
                    <div key={market.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={selected}
                        onCheckedChange={() => handleArrayToggle("primaryMarkets", market.value)}
                      />
                      <Label htmlFor={id} className="text-sm">
                        {market.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : businessObject?.country === "china" ? (
            <div className="mt-6">
              <Label className="text-sm font-semibold text-gray-700">Indonesia</Label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {INDONESIA_PRIMARY_MARKETS.map((market) => {
                  const id = toCheckboxId("primaryMarket", market.value);
                  const selected = (surveyData?.primaryMarkets ?? []).includes(market.value);

                  return (
                    <div key={market.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={selected}
                        onCheckedChange={() => handleArrayToggle("primaryMarkets", market.value)}
                      />
                      <Label htmlFor={id} className="text-sm">
                        {market.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Product Focus</h2>
        <p className="text-slate-600">
          Help us understand what products you work with
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">
            Product Categories (Select all that apply)
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {APPAREL_CATEGORIES.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={surveyData.productCategories.includes(category.value)}
                  onCheckedChange={() =>
                    handleArrayToggle("productCategories", category.value)
                  }
                />
                <Label htmlFor={category.value} className="text-sm">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">
            Preferred Materials (Select all that apply)
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {APPAREL_MATERIALS.map((material) => (
              <div key={material.value} className="flex items-center space-x-2">
                <Checkbox
                  id={material.value}
                  checked={surveyData.materials.includes(material.value)}
                  onCheckedChange={() =>
                    handleArrayToggle("materials", material.value)
                  }
                />
                <Label htmlFor={material.value} className="text-sm">
                  {material.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Custom Tags</h2>
        <p className="text-slate-600">
          Add any additional preferences or requirements of your discovery
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {customTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeCustomTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </Button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a custom tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomTag}
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/**
        <div className="mb-6">
          <Link
            href={`/auth/license-upload`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to license upload</span>
          </Link>
        </div> */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardDescription>
              Complete this quick survey to personalize your experience and get
              better recommendations
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
              {[1, 2, 3].map((step) => (
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
                  {step < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

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
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
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
                onClick={handleSubmit}
                className="text-slate-500 hover:text-slate-700"
              >
                Skip for now (you can complete this later)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
