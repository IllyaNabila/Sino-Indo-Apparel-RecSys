"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  FileText,
  Filter,
  Calendar,
  Building2,
  Mail,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { toastApiError } from "@/lib/toastApiError";

type Business = {
  _id: string;
  companyName: string;
  companyEmail?: string;
  role: string;
  country: string;
};

type VerificationStatus = "pending" | "approved" | "rejected";

type LicenseCounts = {
  pending: number;
  approved: number;
  rejected: number;
};

// ✅ List view type (NO base64 `data`)
type LicenseSubmissionMeta = {
  _id: string;
  filename: string;
  mimetype: string;
  uploadedAt: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  businessId: Business;
};

// ✅ Full document type (WITH base64 `data`)
type LicenseSubmissionFull = LicenseSubmissionMeta & {
  data: string;
};

type SortBy = "date-desc" | "date-asc" | "company-asc" | "company-desc";

export default function AdminLicensesPage() {
  const [tabStatus, setTabStatus] = useState<VerificationStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [counts, setCounts] = useState<LicenseCounts>({ pending: 0, approved: 0, rejected: 0 });

  const [licenses, setLicenses] = useState<LicenseSubmissionMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // dialogs
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<LicenseSubmissionMeta | null>(null);

  // cache full docs so reopening preview doesn’t refetch
  const [docCache, setDocCache] = useState<Record<string, LicenseSubmissionFull>>({});
  const previewFull = previewMeta?._id ? docCache[previewMeta._id] : undefined;

  // =========================
  // Fetch list (metadata only)
  // =========================
  useEffect(() => {
    const controller = new AbortController();

    const fetchLicenses = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await axios.get(`/api/admin/licenses?status=${tabStatus}`, {
          signal: controller.signal,
        });

        setLicenses(res.data.data ?? []);
        setCounts(res.data.counts ?? { pending: 0, approved: 0, rejected: 0 });
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        setLoadError(err?.response?.data?.message || err?.message || "Failed to fetch licenses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLicenses();

    return () => controller.abort();
  }, [tabStatus]);

  // =========================
  // Derived filtered + sorted
  // =========================
  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();

    const base = licenses.filter((s) => {
      const matchesSearch = q === "" || s.businessId.companyName.toLowerCase().includes(q);
      const matchesTab = tabStatus === "all" || s.verificationStatus === tabStatus;
      return matchesSearch && matchesTab;
    });

    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "date-desc":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "company-asc":
          return a.businessId.companyName.localeCompare(b.businessId.companyName);
        case "company-desc":
          return b.businessId.companyName.localeCompare(a.businessId.companyName);
        default:
          return 0;
      }
    });

    return sorted;
  }, [licenses, deferredSearch, tabStatus, sortBy]);

  // =========================
  // Mutations (approve/reject)
  // =========================
  const patchStatus = useCallback(
    async (licenseId: string, next: VerificationStatus, reason?: string) => {
      // optimistic update + rollback
      const prev = licenses;
      setLicenses((cur) =>
        cur.map((x) =>
          x._id === licenseId
            ? {
                ...x,
                verificationStatus: next,
                rejectionReason: next === "rejected" ? reason : undefined,
                verifiedAt: next === "approved" ? new Date().toISOString() : x.verifiedAt,
              }
            : x,
        ),
      );

      try {
        await axios.patch("/api/admin/licenses", {
          licenseId,
          verificationStatus: next,
          rejectionReason: next === "rejected" ? reason : undefined,
        });
        toast.success(`License ${next}`);
        setIsRejectionDialogOpen(false)
      } catch (e) {
        toastApiError(e);
        setLicenses(prev); // rollback
        throw e;
      }
    },
    [licenses],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await patchStatus(id, "approved");
      } catch (err: any) {
        console.error("Approve failed:", err?.response?.data || err?.message);
      }
    },
    [patchStatus],
  );

  const openRejectionDialog = useCallback((id: string) => {
    setSelectedId(id);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  }, []);

  const handleReject = useCallback(async () => {
    if (!selectedId) return;
    if (!rejectionReason.trim()) return;

    try {
      await patchStatus(selectedId, "rejected", rejectionReason.trim());
      setIsRejectionDialogOpen(false);
      setSelectedId(null);
      setRejectionReason("");
    } catch (err: any) {
      console.error("Reject failed:", err?.response?.data || err?.message);
    }
  }, [selectedId, rejectionReason, patchStatus]);

  // =========================
  // Preview (fetch on demand)
  // =========================
  const openPreview = useCallback(async (meta: LicenseSubmissionMeta) => {
    setPreviewMeta(meta);
    setIsPreviewDialogOpen(true);

    if (docCache[meta._id]) return;

    try {
      const res = await axios.get(`/api/admin/licenses/${meta._id}`);
      const full: LicenseSubmissionFull = res.data.data;

      setDocCache((cur) => ({ ...cur, [meta._id]: full }));
    } catch (err: any) {
      console.error("Preview fetch failed:", err?.response?.data || err?.message);
    }
  }, [docCache]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 space-y-6">
        {/* top bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={tabStatus} onValueChange={(v) => setTabStatus(v as any)}>
              <SelectTrigger className="w-[170px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All ({counts.pending + counts.approved + counts.rejected})
                </SelectItem>
                <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="company-asc">Company (A-Z)</SelectItem>
                <SelectItem value="company-desc">Company (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadError && (
          <Card>
            <CardContent className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {loadError}
            </CardContent>
          </Card>
        )}

        <Tabs value={tabStatus} onValueChange={(v) => setTabStatus(v as any)} className="space-y-6">
          <TabsContent value={tabStatus} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-3" />
                  <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No submissions found</h3>
                  <p className="text-slate-600">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((s) => (
                <SubmissionCardDB
                  key={s._id}
                  submission={s}
                  onApprove={handleApprove}
                  onReject={openRejectionDialog}
                  onPreview={openPreview}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Business License</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the business owner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter detailed reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            {!rejectionReason.trim() && (
              <p className="text-sm text-red-500">Rejection reason is required</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>License Document Preview</DialogTitle>
            <DialogDescription>
              {previewMeta?.businessId.companyName} - {previewMeta?.mimetype}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Company Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-slate-400 mr-2" />
                    <span className="font-medium">{previewMeta?.businessId.companyName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <span>{previewMeta?.businessId.companyEmail || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                    <span>Submitted: {previewMeta?.uploadedAt.split("T")[0]}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-slate-500 mb-1">Document Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                    <span>{previewMeta?.mimetype}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className="mr-2">
                      {previewMeta?.businessId.role
                        ? previewMeta.businessId.role.charAt(0).toUpperCase() +
                          previewMeta.businessId.role.slice(1).toLowerCase()
                        : "N/A"}
                    </Badge>
                    <Badge variant="outline">{previewMeta?.businessId.country}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 p-2 text-center text-sm text-slate-600">
                Document Preview
              </div>

              <div className="flex justify-center p-4 bg-white">
                {!previewMeta ? null : !previewFull ? (
                  <div className="w-full max-w-xl">
                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-3" />
                    <div className="h-80 w-full bg-slate-200 rounded animate-pulse" />
                  </div>
                ) : previewFull.mimetype.includes("pdf") ? (
                  <iframe
                    title="PDF Preview"
                    className="w-full h-[520px]"
                    src={`data:application/pdf;base64,${previewFull.data}`}
                  />
                ) : (
                  <img
                    src={`data:${previewFull.mimetype};base64,${previewFull.data}`}
                    alt="License Document"
                    className="max-h-[520px] object-contain"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {previewMeta?.verificationStatus === "pending" && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                    if (previewMeta?._id) openRejectionDialog(previewMeta._id);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    if (previewMeta?._id) handleApprove(previewMeta._id);
                    setIsPreviewDialogOpen(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmissionCardDB({
  submission,
  onApprove,
  onReject,
  onPreview,
}: {
  submission: LicenseSubmissionMeta;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPreview: (s: LicenseSubmissionMeta) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">
                  {submission.businessId.companyName}
                </h3>
                {getStatusBadge(submission.verificationStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center text-slate-600">
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                {submission.businessId.companyEmail || "N/A"}
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                Submitted: {submission.uploadedAt.split("T")[0]}
              </div>
              <div className="flex items-center text-slate-600">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                {submission.mimetype}
              </div>
              <div className="flex items-center text-slate-600">
                <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                {submission.businessId.role} • {submission.businessId.country}
              </div>
            </div>

            {submission.verificationStatus === "rejected" && (
              <div className="mt-3 p-3 bg-red-50 rounded-md">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{submission.rejectionReason}</p>
              </div>
            )}

            {submission.verificationStatus === "approved" && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-md">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Approved on:</span>{" "}
                  {submission.verifiedAt?.split("T")[0] || "N/A"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onPreview(submission)}>
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Button>

            {submission.verificationStatus === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onApprove(submission._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onReject(submission._id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return null;
  }
}
