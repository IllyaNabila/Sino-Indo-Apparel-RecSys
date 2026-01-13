"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useRef } from "react";

export default function LicenseUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "importer";

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileError, setFileError] = useState("");

  // bytes -> nice text (e.g., 2.4 MB)
  const formatBytes = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n = n / 1024;
      i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const MAX_SIZE_MB = 10;
  const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Prefer MIME allowlist (most reliable)
  const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];

  // Optional: extension check as backup (because MIME can be weird sometimes)
  const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"];

  const validateFile = (file: File) => {
    // 1) Size
    if (file.size > MAX_BYTES) {
      console.log("file too large")
      return `File too large. Max ${MAX_SIZE_MB}MB. Your file is ${formatBytes(file.size)}.`;
    }

    // 2) MIME type
    const mimeOk = ALLOWED_MIME.includes(file.type);

    // 3) Extension backup check
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const extOk = ALLOWED_EXT.includes(ext);

    if (!mimeOk && !extOk) {
      return "Invalid file type. Only PDF, JPG, or PNG allowed.";
    }

    return null; // valid
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const err = validateFile(selected);
    if (err) {
      setFile(null);
      setFileError(err);
      e.target.value = ""; // reset input so they can re-pick same file
      return;
    }

    setFileError("");
    setFile(selected);

    // Optional: show info in UI
    console.log("Selected:", selected.name, selected.type, formatBytes(selected.size));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) resolve(base64String);
        else reject("Conversion failed");
      };

      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const err = validateFile(file);
    if (err) {
      setFileError(err);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const base64Data = await convertToBase64(file);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            setUploadComplete(true);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post("/api/users/license-upload", {
        filename: file.name,
        mimetype: file.type,
        data: base64Data,
      });

      console.log("Upload success:", response.data);
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      setUploading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/auth/survey`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/**
        <div className="mb-6">
          <Link
            href={`/auth/business-details`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to business details</span>
          </Link>
        </div> */}

        <Card>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-center">
              Business License Verification
            </h1>
            <p className="text-center text-muted-foreground mt-2">
              Please upload your business license or registration certificate
              for verification
            </p>
          </div>

          <CardHeader>
            <CardTitle>Upload Business License</CardTitle>
            <CardDescription>
              Your business license will be verified by our system. This helps
              ensure all partners on our platform are legitimate businesses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Your document must be a valid business license or registration
                  certificate issued by a government authority. Accepted
                  formats: PDF, JPG, PNG (max 10MB).
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-muted rounded-full p-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your document will be securely stored and only used for
                      verification purposes
                    </p>
                  </div>
                  <Input
                    id="license"
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("license")?.click()}
                    disabled={uploading}
                  >
                    Select File
                  </Button>
                </div>
              </div>

              {file && (
                <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setUploadComplete(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""; // 👈 clear native input value
                      }
                    }}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </div>
              )}
              {!!fileError && <p className="text-red-500">{fileError}</p>}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadComplete && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Upload Complete
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your business license has been uploaded successfully and is
                    pending verification. This typically takes 1-2 working days.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                {!uploadComplete && (
                  <Button type="submit" disabled={!file || uploading}>
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                )}
                {uploadComplete && (
                  <Button type="button" onClick={handleContinue} className="gap-2">
                    Continue to Preferences <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground flex flex-col items-start">
            <p>
              Your document will be reviewed by our verification team. You will
              be notified once the verification is complete.
            </p>
            <p className="mt-2">
              If verification fails, you will be able to see the reason and
              upload a new document.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
