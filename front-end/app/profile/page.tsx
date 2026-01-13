"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useBusiness } from "@/context/BusinessContext";

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
import { Checkbox } from "@/components/ui/checkbox";

import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  X,
  Save,
} from "lucide-react";

// Dynamically import the ProfileButton with SSR turned off
const ProfileButton = dynamic(() => import("@/components/ProfileButton"), {
  ssr: false,
});

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

type CompanyInfo = {
  companyName: string;
  registrationNumber: string;
  address: string;
  email: string;
  phoneNumber: string;
  website: string;
  description: string;
  preferredLanguage: "en" | "id" | "zh" | string;
};

type InitialPreferences = {
  materialPreferences: string[];
  productCategories: Record<string, boolean>;
  customTags: string[];
  partnerRegions: string[];
};

const DEFAULT_CATEGORIES = [
  "T-Shirts",
  "Jeans",
  "Dresses",
  "Hoodies",
  "Jackets",
  "Accessories",
];

const AVAILABLE_MATERIALS = [
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

const LICENSE_MAX_MB = 10;
const LICENSE_ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png"];

function todayISODate() {
  return new Date().toISOString().split("T")[0];
}

function bytesToMB(bytes: number) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

function arraysEqualIgnoreOrder(a: string[], b: string[]) {
  const aa = [...a].sort();
  const bb = [...b].sort();
  return JSON.stringify(aa) === JSON.stringify(bb);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onloadend = () => {
      const result = reader.result?.toString() || "";
      const base64 = result.split(",")[1];
      if (!base64) return reject(new Error("Invalid base64"));
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

function StatusBadge({ status }: { status: LicenseStatus["status"] }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Under Review
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800">
      <AlertCircle className="h-3 w-3 mr-1" />
      Rejected
    </Badge>
  );
}

function HeaderStatusBadge({ status }: { status: LicenseStatus["status"] }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified Business
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Verification Pending
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800">
      <AlertCircle className="h-3 w-3 mr-1" />
      Verification Required
    </Badge>
  );
}

function LicenseStatusPanel({ licenseStatus }: { licenseStatus: LicenseStatus }) {
  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Verification Status</h3>
        <StatusBadge status={licenseStatus.status} />
      </div>

      {licenseStatus.status === "approved" && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            <strong>Submitted:</strong> {licenseStatus.submittedDate}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Approved:</strong> {licenseStatus.approvedDate}
          </p>
          <p className="text-sm text-emerald-600">
            Your business is verified! You can now access all platform features including chat.
          </p>
        </div>
      )}

      {licenseStatus.status === "pending" && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            <strong>Submitted:</strong> {licenseStatus.submittedDate}
          </p>
          <p className="text-sm text-yellow-600">
            Your license is currently under review. We&apos;ll notify you once the review is complete.
          </p>
        </div>
      )}

      {licenseStatus.status === "rejected" && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            <strong>Submitted:</strong> {licenseStatus.submittedDate}
          </p>
          <p className="text-sm text-red-600">
            <strong>Rejection Reason:</strong>{" "}
            {licenseStatus.rejectionReason ||
              "Document quality insufficient. Please upload a clearer image of your business license."}
          </p>
          <p className="text-sm text-slate-600">
            Please upload a corrected document to proceed with verification.
          </p>
        </div>
      )}
    </div>
  );
}

function LicenseUploader(props: {
  licenseStatus: LicenseStatus;
  onSubmitted: () => void;
}) {
  const { licenseStatus, onSubmitted } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const chooseFile = () => fileInputRef.current?.click();

  const clearSelected = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = bytesToMB(file.size);
    if (sizeMB > LICENSE_MAX_MB) {
      alert(`File too large. Max ${LICENSE_MAX_MB}MB.`);
      e.target.value = "";
      return;
    }

    if (!LICENSE_ALLOWED_MIMES.includes(file.type)) {
      alert("Only PDF, JPG, PNG allowed.");
      e.target.value = "";
      return;
    }

    // create preview
    const url = URL.createObjectURL(file);

    // clear previous preview (if any)
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(url);

    // allow selecting the same file again later
    e.target.value = "";
  };

  const canSubmit =
    !!selectedFile &&
    !submitting &&
    licenseStatus.status !== "pending" &&
    licenseStatus.status !== "approved";

  const isPdf = selectedFile?.type === "application/pdf";

  const submit = async () => {
    if (!selectedFile) return;

    try {
      setSubmitting(true);

      const base64Data = await fileToBase64(selectedFile);

      await axios.patch("/api/users/license-upload", {
        filename: selectedFile.name,
        mimetype: selectedFile.type,
        data: base64Data,
      });

      onSubmitted();
      clearSelected();
    } catch (err: any) {
      console.error("Upload failed:", err.response?.data || err.message);
      // If you have toastApiError, replace console with it:
      // toastApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        {licenseStatus.status === "rejected"
          ? "Re-submit Business License"
          : "Upload Business License"}
      </h3>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
        {!selectedFile ? (
          <div className="text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <div className="space-y-2">
              <Button type="button" variant="outline" onClick={chooseFile}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>

              <Input
                id="license-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={fileInputRef}
                className="hidden"
                onChange={onSelectFile}
              />

              <p className="text-sm text-slate-500">
                Upload your business license (PDF, JPG, PNG up to 10MB)
              </p>

              {licenseStatus.status === "pending" && (
                <p className="text-sm text-yellow-700">
                  Your submission is under review. You can’t submit a new one until it’s approved/rejected.
                </p>
              )}
              {licenseStatus.status === "approved" && (
                <p className="text-sm text-emerald-700">
                  Your business is already verified. No further submission needed.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File meta + actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {isPdf ? "PDF Document" : "Image"} • {bytesToMB(selectedFile.size)}MB
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSelected}
                  disabled={submitting}
                >
                  Remove
                </Button>

                <Button type="button" onClick={submit} disabled={!canSubmit}>
                  {submitting ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-lg border bg-white overflow-hidden">
                {isPdf ? (
                  <iframe
                    title="License PDF Preview"
                    src={previewUrl}
                    className="w-full h-[520px]"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Business license preview"
                    className="w-full max-h-[520px] object-contain"
                  />
                )}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Tip: If the preview looks blurry, upload a clearer scan/photo before submitting.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Document Requirements:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Valid business registration certificate or license</li>
          <li>• Document must be clearly readable</li>
          <li>• Company name must match your profile information</li>
          <li>• Document must be current and not expired</li>
        </ul>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { businessObject } = useBusiness();

  // -----------------------------
  // Company info state
  // -----------------------------
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    registrationNumber: "",
    address: "",
    email: "",
    phoneNumber: "",
    website: "",
    description: "",
    preferredLanguage: "en",
  });

  const [initialCompanyInfo, setInitialCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    registrationNumber: "",
    address: "",
    email: "",
    phoneNumber: "",
    website: "",
    description: "",
    preferredLanguage: "en",
  });

  // -----------------------------
  // License state
  // -----------------------------
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    status: "approved",
    submittedDate: "2024-01-15",
    approvedDate: "2024-01-20",
    rejectionReason: "",
  });

  // -----------------------------
  // Preferences state
  // -----------------------------
  const [materialPreferences, setMaterialPreferences] = useState<string[]>([
    "Organic Cotton",
    "Recycled Polyester",
    "Bamboo Fiber",
    "Hemp",
  ]);

  const [productCategories, setProductCategories] = useState<Record<string, boolean>>({
    "T-Shirts": false,
    Jeans: false,
    Dresses: false,
    Hoodies: false,
    Jackets: false,
    Accessories: false,
  });

  const [customTag, setCustomTag] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const [partnerPreferences, setPartnerPreferences] = useState<PartnerPreferences>({
    regions: [],
    certifications: ["GOTS", "OEKO-TEX", "Fair Trade"],
    businessSize: "Medium",
    responseTime: "Within 24 hours",
  });

  const [initialPreferences, setInitialPreferences] = useState<InitialPreferences>({
    materialPreferences: [],
    productCategories: {},
    customTags: [],
    partnerRegions: [],
  });

  const toTitleCase = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // -----------------------------
  // Derived "changed" flags
  // -----------------------------
  const isCompanyInfoChanged = useMemo(() => {
    return (
      companyInfo.companyName !== initialCompanyInfo.companyName ||
      companyInfo.registrationNumber !== initialCompanyInfo.registrationNumber ||
      companyInfo.address !== initialCompanyInfo.address ||
      companyInfo.description !== initialCompanyInfo.description ||
      companyInfo.preferredLanguage !== initialCompanyInfo.preferredLanguage
    );
  }, [companyInfo, initialCompanyInfo]);

  const isPreferencesChanged = useMemo(() => {
    const materialsChanged = !arraysEqualIgnoreOrder(
      materialPreferences,
      initialPreferences.materialPreferences
    );

    const categoriesChanged =
      JSON.stringify(productCategories) !==
      JSON.stringify(initialPreferences.productCategories);

    const tagsChanged = !arraysEqualIgnoreOrder(
      customTags.filter((t) => t.trim() !== ""),
      initialPreferences.customTags
    );

    const regionsChanged = !arraysEqualIgnoreOrder(
      partnerPreferences.regions,
      initialPreferences.partnerRegions
    );

    return materialsChanged || categoriesChanged || tagsChanged || regionsChanged;
  }, [
    materialPreferences,
    productCategories,
    customTags,
    partnerPreferences.regions,
    initialPreferences,
  ]);

  // -----------------------------
  // Handlers
  // -----------------------------
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
        preferredLanguage: companyInfo.preferredLanguage,
      });

      console.log("Update success:", response.data);
      setInitialCompanyInfo(companyInfo);
    } catch (error: any) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  const handleAddMaterial = (material: string) => {
    setMaterialPreferences((prev) =>
      prev.includes(material) ? prev : [...prev, material]
    );
  };

  const handleRemoveMaterial = (material: string) => {
    setMaterialPreferences((prev) => prev.filter((m) => m !== material));
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    setCustomTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCustomTag("");
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setProductCategories((prev) =>
      Object.prototype.hasOwnProperty.call(prev, trimmed)
        ? prev
        : { ...prev, [trimmed]: true }
    );
    setNewCategory("");
  };

  const handleAddRegion = () => {
    const trimmed = newRegion.trim();
    if (!trimmed) return;

    setPartnerPreferences((prev) =>
      prev.regions.includes(trimmed)
        ? prev
        : { ...prev, regions: [...prev.regions, trimmed] }
    );
    setNewRegion("");
  };

  const handleSavePreferences = async () => {
    const selectedCategories = Object.entries(productCategories)
      .filter(([_, isChecked]) => Boolean(isChecked))
      .map(([category]) => category);

    const payload = {
      materials: materialPreferences,
      productCategories: selectedCategories,
      regions: partnerPreferences.regions,
      customTags: customTags.filter((tag) => tag.trim() !== ""),
    };

    try {
      const res = await axios.patch("/api/users/survey", { preference: payload });
      console.log("Preferences saved:", res.data);

      // Update initial snapshot to match current values
      setInitialPreferences({
        materialPreferences: materialPreferences,
        productCategories: productCategories,
        customTags: payload.customTags,
        partnerRegions: partnerPreferences.regions,
      });
    } catch (err: any) {
      console.error("Error saving preferences:", err.response?.data || err.message);
    }
  };

  // When license is submitted, update status locally
  const onLicenseSubmitted = () => {
    setLicenseStatus((prev) => ({
      ...prev,
      status: "pending",
      submittedDate: todayISODate(),
      approvedDate: "",
      rejectionReason: "",
    }));
  };

  // -----------------------------
  // Effects: fetch profile + sync context
  // -----------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        const data = res.data;

        // Company info
        const newCompany: CompanyInfo = {
          companyName: data.companyInfo?.companyName || "",
          registrationNumber: data.companyInfo?.registrationNumber || "",
          address: data.companyInfo?.address || "",
          email: data.companyInfo?.email || "",
          phoneNumber: data.companyInfo?.phoneNumber || "",
          website: data.companyInfo?.website || "",
          description: data.companyInfo?.description || "",
          preferredLanguage: data.companyInfo?.preferredLanguage || "en",
        };
        setCompanyInfo(newCompany);
        setInitialCompanyInfo(newCompany);

        // License status
        if (data.licenseStatus) setLicenseStatus(data.licenseStatus);

        // Preferences
        const prefs = data.preference || {};

        const mats: string[] = prefs.materialPreferences || prefs.materials || [];
        const tags: string[] = prefs.customTags || [];
        const regions: string[] = prefs.regions || [];
        const selectedCategories: string[] = prefs.productCategories || [];

        // build categories object from defaults, but allow your existing dynamic additions too
        const mergedCategoryList = Array.from(
          new Set([...DEFAULT_CATEGORIES, ...selectedCategories])
        );

        const categoryObj: Record<string, boolean> = {};
        mergedCategoryList.forEach((cat) => {
          categoryObj[cat] = selectedCategories.includes(cat) || DEFAULT_CATEGORIES.includes(cat)
            ? selectedCategories.includes(cat)
            : true;
        });

        // If API returns empty categories, keep existing state instead of wiping
        const safeCategoryObj =
          selectedCategories.length > 0 ? categoryObj : productCategories;

        setMaterialPreferences(mats);
        setCustomTags(tags);
        setPartnerPreferences((prev) => ({ ...prev, regions }));
        setProductCategories(safeCategoryObj);

        setInitialPreferences({
          materialPreferences: mats,
          productCategories: safeCategoryObj,
          customTags: tags,
          partnerRegions: regions,
        });
      } catch (err: any) {
        console.error("Error fetching profile:", err.response?.data?.error || err.message);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!businessObject) return;
    const info: CompanyInfo = {
      companyName: businessObject.companyName || "",
      registrationNumber: businessObject.registrationNumber || "",
      address: businessObject.address || "",
      email: businessObject.email || "",
      phoneNumber: businessObject.phoneNumber || "",
      website: businessObject.website || "",
      description: businessObject.description || "",
      preferredLanguage: businessObject.preferredLanguage || "en",
    };
    setCompanyInfo(info);
    setInitialCompanyInfo(info);
  }, [businessObject]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Business Profile</h1>
            <p className="text-slate-600">
              Manage your company information, verification, and preferences
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <HeaderStatusBadge status={licenseStatus.status} />
            <ProfileButton />
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

          {/* ---------------- Company ---------------- */}
          <TabsContent value="company" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>Update your business information</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleCompanyInfoUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-name">Company Name</Label>
                          <Textarea
                            id="company-name"
                            value={companyInfo.companyName}
                            onChange={(e) =>
                              setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration Number</Label>
                          <Textarea
                            id="registrationNumber"
                            value={companyInfo.registrationNumber}
                            onChange={(e) =>
                              setCompanyInfo({
                                ...companyInfo,
                                registrationNumber: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredLanguage">Preferred Language</Label>
                          <Select
                            value={companyInfo.preferredLanguage}
                            onValueChange={(value) =>
                              setCompanyInfo({ ...companyInfo, preferredLanguage: value })
                            }
                          >
                            <SelectTrigger id="preferredLanguage">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="id">Bahasa Indonesia</SelectItem>
                              <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">State/Province</Label>
                        <Input
                          id="address"
                          value={companyInfo.address}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          rows={4}
                          value={companyInfo.description}
                          onChange={(e) =>
                            setCompanyInfo({ ...companyInfo, description: e.target.value })
                          }
                          placeholder="Describe your company, products, and services..."
                          required
                        />
                      </div>

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

          {/* ---------------- License ---------------- */}
          <TabsContent value="license" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business License Verification</CardTitle>
                <CardDescription>
                  Upload your business license to get verified and unlock chat functionality
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <LicenseStatusPanel licenseStatus={licenseStatus} />
                <LicenseUploader licenseStatus={licenseStatus} onSubmitted={onLicenseSubmitted} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Preferences ---------------- */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Business Preferences</h2>
                <p className="text-slate-600">
                  Customize your experience and improve recommendations
                </p>
              </div>

              <div className="flex items-center space-x-2">
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
                <CardDescription>Select materials you prefer to work with</CardDescription>
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
                        type="button"
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
                      {AVAILABLE_MATERIALS.filter((m) => !materialPreferences.includes(m)).map(
                        (material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Product Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Select product categories you&apos;re interested in</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(productCategories).map(([category, checked]) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={checked}
                        onCheckedChange={(isChecked) =>
                          setProductCategories((prev) => ({
                            ...prev,
                            [category]: Boolean(isChecked),
                          }))
                        }
                      />
                      <Label htmlFor={category} className="cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                  <Button type="button" onClick={handleAddCategory} variant="outline">
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
                      {toTitleCase(tag)}
                      <button
                        type="button"
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
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag()}
                  />
                  <Button type="button" onClick={handleAddCustomTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Partner Preferences (regions) */}
            <Card>
              <CardHeader>
                <CardTitle>Partner Preferences</CardTitle>
                <CardDescription>
                  Set preferences for the types of partners you want to connect with
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Preferred Regions</Label>

                  <div className="flex flex-wrap gap-2">
                    {partnerPreferences.regions.map((region) => (
                      <Badge key={region} variant="secondary" className="flex items-center gap-1">
                        {toTitleCase(region)}
                        <button
                          type="button"
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
                    <Button type="button" onClick={handleAddRegion} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
