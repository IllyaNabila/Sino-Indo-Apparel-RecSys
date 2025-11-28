"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Building2,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  Plus,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

type PartnerPreferences = {
  regions: string[];
  certifications: string[];
  businessSize: string;
  responseTime: string;
};

type LicenseStatus = {
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedDate: string;
  rejectionReason: string;
};

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    registrationNumber: "",
    address: "",
    email: "",
    phoneNumber: "",
    website: "",
    description: "",
  });

  const [initialCompanyInfo, setInitialCompanyInfo] = useState({
    companyName: "",
    registrationNumber: "",
    address: "",
    email: "",
    phoneNumber: "",
    website: "",
    description: "",
  });
  const [isCompanyInfoChanged, setIsCompanyInfoChanged] = useState(false);

  // State for tracking preference changes
  const [isPreferencesChanged, setIsPreferencesChanged] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState({
    materialPreferences: [] as string[],
    productCategories: {} as Record<string, boolean>,
    customTags: [] as string[],
    partnerRegions: [] as string[],
  });

  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    status: "approved", // pending, approved, rejected
    submittedDate: "2024-01-15",
    approvedDate: "2024-01-20",
    rejectionReason: "",
  });

  // Preferences state
  const [materialPreferences, setMaterialPreferences] = useState([
    "Organic Cotton",
    "Recycled Polyester",
    "Bamboo Fiber",
    "Hemp",
  ]);
  const [seasonPreferences, setSeasonPreferences] = useState([
    "Spring",
    "Summer",
  ]);
  const [priceRange, setPriceRange] = useState([10, 50]);
  const [moqRange, setMoqRange] = useState([100, 1000]);
  const [customTag, setCustomTag] = useState("");
  const [customTags, setCustomTags] = useState([""]);
  // "Eco-friendly","Fast delivery","Small batch orders",
  const [newCategory, setNewCategory] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const [productCategories, setProductCategories] = useState<
    Record<string, boolean>
  >({
    "T-Shirts": true,
    Jeans: true,
    Dresses: false,
    Hoodies: true,
    Jackets: false,
    Accessories: false,
  });

  const [partnerPreferences, setPartnerPreferences] = useState<PartnerPreferences>({
    regions: [],
    certifications: ["GOTS", "OEKO-TEX", "Fair Trade"],
    businessSize: "Medium",
    responseTime: "Within 24 hours",
  });

  const availableMaterials = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Organic Cotton",
    "Recycled Polyester",
    "Bamboo Fiber",
    "Hemp",
    "Tencel",
    "Modal",
    "Spandex",
  ];

  const availableSeasons = ["Spring", "Summer", "Fall", "Winter", "All Season"];

  const handleCompanyInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.patch("/api/users/profile", {
        companyName: companyInfo.companyName,
        registrationNumber: companyInfo.registrationNumber,
        address: companyInfo.address,
        phoneNumber: companyInfo.phoneNumber,
        website: companyInfo.website,
        description: companyInfo.description,
      });

      console.log("Update success:", response.data);
      setIsCompanyInfoChanged(false); // Reset after successful save
      // Optionally show success message or toast
    } catch (error: any) {
      console.error("Update failed:", error.response?.data || error.message);
      // Optionally show error message
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Logo uploaded:", file.name);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

    const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name); // <== ADD THIS

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result?.toString().split(",")[1];
      if (!base64Data) return;

      try {
        const res = await axios.patch("/api/users/license-upload", {
          filename: file.name,
          mimetype: file.type,
          data: base64Data,
        });

        setLicenseStatus((prev) => ({
          ...prev,
          status: "pending",
          submittedDate: new Date().toISOString().split("T")[0],
          approvedDate: "",
          rejectionReason: "",
        }));

        console.log("Upload success:", res.data);
      } catch (err: any) {
        console.error("Upload failed:", err.response?.data || err.message);
      }
    };

    reader.readAsDataURL(file);
  };

  // Preference handlers
  const handleAddMaterial = (material: string) => {
    if (!materialPreferences.includes(material)) {
      setMaterialPreferences([...materialPreferences, material]);
    }
  };

  const handleRemoveMaterial = (material: string) => {
    setMaterialPreferences(materialPreferences.filter((m) => m !== material));
  };

  const handleAddSeason = (season: string) => {
    if (!seasonPreferences.includes(season)) {
      setSeasonPreferences([...seasonPreferences, season]);
    }
  };

  const handleRemoveSeason = (season: string) => {
    setSeasonPreferences(seasonPreferences.filter((s) => s !== season));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !customTags.includes(customTag.trim())) {
      setCustomTags([...customTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !productCategories.hasOwnProperty(trimmed)) {
      setProductCategories((prev) => ({ ...prev, [trimmed]: true }));
      setNewCategory("");
    }
  };

  const handleAddRegion = () => {
    const trimmed = newRegion.trim();
    if (trimmed && !partnerPreferences.regions.includes(trimmed)) {
      setPartnerPreferences((prev) => ({
        ...prev,
        regions: [...prev.regions, trimmed],
      }));
      setNewRegion("");
    }
  };

  const handleSavePreferences = async () => {
    const selectedCategories = Object.entries(productCategories)
      .filter(([_, isChecked]) => isChecked)
      .map(([category]) => category);

    const payload = {
      materials: materialPreferences,
      productCategories: selectedCategories,
      regions: partnerPreferences.regions,
      customTags: customTags.filter((tag) => tag.trim() !== ""),
    };

    try {
      const res = await axios.patch("/api/users/survey", {
        preference: payload,
      });

      console.log("Preferences saved:", res.data);
      // Optionally: Show toast notification or UI feedback
    } catch (err: any) {
      console.error("Error saving preferences:", err.response?.data || err.message);
      // Optionally: Show error feedback
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        const data = res.data;

        setCompanyInfo(data.companyInfo);
        setInitialCompanyInfo(data.companyInfo);
        setLicenseStatus(data.licenseStatus);
        // Extract preference data
        const prefs = data.preference || {};

        // Set material preferences
        setMaterialPreferences(prefs.materialPreferences || []);

        // Set custom tags
        setCustomTags(prefs.customTags || []);

        // Set partner regions
        setPartnerPreferences((prev) => ({
          ...prev,
          regions: prefs.regions || [],
        }));

        // Convert productCategories array into object
        const allCategories = [
          "T-Shirts",
          "Jeans",
          "Dresses",
          "Hoodies",
          "Jackets",
          "Accessories",
        ];
        const selectedCategories = prefs.productCategories || [];
        const categoryObj: Record<string, boolean> = {};

        allCategories.forEach((cat) => {
          categoryObj[cat] = selectedCategories.includes(cat);
        });

        setProductCategories(categoryObj);

        setInitialPreferences({
          materialPreferences: prefs.materialPreferences || [],
          productCategories: categoryObj,
          customTags: prefs.customTags || [],
          partnerRegions: prefs.regions || [],
        });
      } catch (err: any) {
        console.error(
          "Error fetching profile:",
          err.response?.data?.error || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const hasChanged =
      companyInfo.companyName !== initialCompanyInfo.companyName ||
      companyInfo.registrationNumber !==
        initialCompanyInfo.registrationNumber ||
      companyInfo.address !== initialCompanyInfo.address ||
      companyInfo.description !== initialCompanyInfo.description;

    setIsCompanyInfoChanged(hasChanged);
  }, [companyInfo, initialCompanyInfo]);

  useEffect(() => {
    const materialsChanged =
      JSON.stringify(materialPreferences.sort()) !==
      JSON.stringify(initialPreferences.materialPreferences.sort());
    const categoriesChanged =
      JSON.stringify(productCategories) !==
      JSON.stringify(initialPreferences.productCategories);
    const tagsChanged =
      JSON.stringify(customTags.sort()) !==
      JSON.stringify(initialPreferences.customTags.sort());
    const regionsChanged =
      JSON.stringify(partnerPreferences.regions.sort()) !==
      JSON.stringify(initialPreferences.partnerRegions.sort());

    setIsPreferencesChanged(
      materialsChanged || categoriesChanged || tagsChanged || regionsChanged
    );
  }, [materialPreferences, productCategories, customTags, partnerPreferences.regions, initialPreferences]);


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Business Profile
            </h1>
            <p className="text-slate-600">
              Manage your company information, verification, and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {licenseStatus.status === "approved" && (
              <Badge className="bg-emerald-100 text-emerald-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Business
              </Badge>
            )}
            {licenseStatus.status === "pending" && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Verification Pending
              </Badge>
            )}
            {licenseStatus.status === "rejected" && (
              <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Verification Required
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company">Company Information</TabsTrigger>
            <TabsTrigger value="license">License Management</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Company Logo 
              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>Upload your company logo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                      <Building2 className="h-12 w-12 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <Button variant="outline" className="w-full">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>*/}

              {/* Company Information Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>
                      Update your business information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleCompanyInfoUpdate}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name</Label>
                          <Textarea
                            id="company-name"
                            value={companyInfo.companyName}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                companyName: e.target.value,
                              })
                            }
                          />
                        </div>
                        {/* Registration Number*/}
                        <div className="space-y-2">
                          <Label htmlFor="registration number">
                            Registration Number
                          </Label>
                          <Textarea
                            id="registrationNumber"
                            value={companyInfo.registrationNumber}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                registrationNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        {/*
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={companyInfo.email}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                          />
                        </div>*/}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Textarea
                          id="address"
                          rows={3}
                          value={companyInfo.address}
                          onChange={(e) =>
                            setCompanyInfo({
                              ...companyInfo,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          rows={4}
                          value={companyInfo.description}
                          onChange={(e) =>
                            setCompanyInfo({
                              ...companyInfo,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe your company, products, and services..."
                        />
                      </div>

                      {/**
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={companyInfo.phoneNumber}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                phoneNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={companyInfo.website}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                website: e.target.value,
                              })
                            }
                            placeholder="www.yourcompany.com"
                          />
                        </div>
                      </div> */}

                      <Button
                        type="submit"
                        disabled={!isCompanyInfoChanged}
                        className="bg-rose-500 hover:bg-rose-600"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="license" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business License Verification</CardTitle>
                <CardDescription>
                  Upload your business license to get verified and unlock chat
                  functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* License Status */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Verification Status</h3>
                    {licenseStatus.status === "approved" && (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {licenseStatus.status === "pending" && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Under Review
                      </Badge>
                    )}
                    {licenseStatus.status === "rejected" && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>

                  {licenseStatus.status === "approved" && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <strong>Submitted:</strong>{" "}
                        {licenseStatus.submittedDate}
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Approved:</strong> {licenseStatus.approvedDate}
                      </p>
                      <p className="text-sm text-emerald-600">
                        Your business is verified! You can now access all
                        platform features including chat.
                      </p>
                    </div>
                  )}

                  {licenseStatus.status === "pending" && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <strong>Submitted:</strong>{" "}
                        {licenseStatus.submittedDate}
                      </p>
                      <p className="text-sm text-yellow-600">
                        Your license is currently under review. We'll notify you
                        once the review is complete.
                      </p>
                    </div>
                  )}

                  {licenseStatus.status === "rejected" && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <strong>Submitted:</strong>{" "}
                        {licenseStatus.submittedDate}
                      </p>
                      <p className="text-sm text-red-600">
                        <strong>Rejection Reason:</strong>{" "}
                        {licenseStatus.rejectionReason ||
                          "Document quality insufficient. Please upload a clearer image of your business license."}
                      </p>
                      <p className="text-sm text-slate-600">
                        Please upload a corrected document to proceed with
                        verification.
                      </p>
                    </div>
                  )}
                </div>

                {/* License Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {licenseStatus.status === "rejected"
                      ? "Re-submit Business License"
                      : "Upload Business License"}
                  </h3>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Label
                        htmlFor="license-upload"
                        className="cursor-pointer"
                      >
                        <Button variant="outline" onClick={handleChooseFileClick}>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </Label>
                      <Input
                        id="license-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleLicenseUpload}
                      />
                      <p className="text-sm text-slate-500">
                        Upload your business license (PDF, JPG, PNG up to 10MB)
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Document Requirements:
                    </h4>
                    {/**<ul className="text-sm text-blue-700 space-y-1">
                      <li>• Valid business registration certificate or license</li>
                      <li>• Document must be clearly readable</li>
                      <li>• Company name must match your profile information</li>
                      <li>• Document must be current and not expired</li>
                    </ul>*/}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Business Preferences
                </h2>
                <p className="text-slate-600">
                  Customize your experience and improve recommendations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/**<Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>*/}
                <Button
                  onClick={handleSavePreferences}
                  disabled={!isPreferencesChanged}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div> 
            </div>

            {/* Material Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Material Preferences</CardTitle>
                <CardDescription>
                  Select materials you prefer to work with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {materialPreferences.map((material) => (
                    <Badge
                      key={material}
                      variant="default"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {material}
                      <button
                        onClick={() => handleRemoveMaterial(material)}
                        className="ml-2 hover:bg-emerald-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div>
                  <Label>Add Material</Label>
                  <Select onValueChange={handleAddMaterial}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a material to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials
                        .filter(
                          (material) => !materialPreferences.includes(material)
                        )
                        .map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Season Preferences 
            <Card>
              <CardHeader>
                <CardTitle>Season Preferences</CardTitle>
                <CardDescription>Select seasons you typically focus on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {seasonPreferences.map((season) => (
                    <Badge key={season} variant="default" className="bg-blue-600 hover:bg-blue-700">
                      {season}
                      <button
                        onClick={() => handleRemoveSeason(season)}
                        className="ml-2 hover:bg-blue-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div>
                  <Label>Add Season</Label>
                  <Select onValueChange={handleAddSeason}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a season to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeasons
                        .filter((season) => !seasonPreferences.includes(season))
                        .map((season) => (
                          <SelectItem key={season} value={season}>
                            {season}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>*/}

            {/* Price and MOQ Ranges 
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Price Range</CardTitle>
                  <CardDescription>Set your preferred price range per piece (USD)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Current range: ${priceRange[0]} - ${priceRange[1]} per piece
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MOQ Range</CardTitle>
                  <CardDescription>Set your preferred minimum order quantity range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={moqRange}
                      onValueChange={setMoqRange}
                      max={5000}
                      min={50}
                      step={50}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{moqRange[0]} pcs</span>
                    <span>{moqRange[1]} pcs</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Current range: {moqRange[0]} - {moqRange[1]} pieces
                  </p>
                </CardContent>
              </Card>
            </div>*/}

            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Select product categories you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(productCategories).map(
                    ([category, checked]) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category}
                          checked={checked}
                          onCheckedChange={(isChecked) =>
                            setProductCategories({
                              ...productCategories,
                              [category]: isChecked as boolean,
                            })
                          }
                        />
                        <Label htmlFor={category} className="cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Preference Tags</CardTitle>
                <CardDescription>
                  Add custom tags to help us understand your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-purple-200 text-purple-700"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveCustomTag(tag)}
                        className="ml-2 hover:bg-purple-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddCustomTag()
                    }
                  />
                  <Button onClick={handleAddCustomTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Partner Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Partner Preferences</CardTitle>
                <CardDescription>
                  Set preferences for the types of partners you want to connect
                  with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Preferred Regions</Label>
                    <div className="flex flex-wrap gap-2">
                      {partnerPreferences.regions.map((region) => (
                        <Badge
                          key={region}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {region}
                          <button
                            onClick={() =>
                              setPartnerPreferences((prev) => ({
                                ...prev,
                                regions: prev.regions.filter((r) => r !== region),
                              }))
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Input
                        placeholder="Add new region"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddRegion()}
                      />
                      <Button onClick={handleAddRegion} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>
                  {/**<div className="space-y-2">
                    <Label>Business Size Preference</Label>
                    <Select
                      value={partnerPreferences.businessSize}
                      onValueChange={(value) =>
                        setPartnerPreferences({
                          ...partnerPreferences,
                          businessSize: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">
                          Small (1-50 employees)
                        </SelectItem>
                        <SelectItem value="Medium">
                          Medium (51-200 employees)
                        </SelectItem>
                        <SelectItem value="Large">
                          Large (200+ employees)
                        </SelectItem>
                        <SelectItem value="Any">Any Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>*/}
                </div>
                {/**<div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Required Certifications</Label>
                    <div className="flex flex-wrap gap-2">
                      {partnerPreferences.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Response Time</Label>
                    <Select
                      value={partnerPreferences.responseTime}
                      onValueChange={(value) => setPartnerPreferences({ ...partnerPreferences, responseTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Within 1 hour">Within 1 hour</SelectItem>
                        <SelectItem value="Within 24 hours">Within 24 hours</SelectItem>
                        <SelectItem value="Within 3 days">Within 3 days</SelectItem>
                        <SelectItem value="Within 1 week">Within 1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>*/}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
