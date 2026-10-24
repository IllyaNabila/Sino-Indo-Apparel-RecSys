// /api/admin/licenses/route.ts
import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { parseJson } from "@/lib/parseJson";
import { BadRequestError, NotFoundError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await connect();

  const statusParam = request.nextUrl.searchParams.get("status")?.toLowerCase();
  const status = statusParam && statusParam !== "all" ? statusParam : null;

  if (
    statusParam &&
    !["all", "pending", "approved", "rejected"].includes(statusParam)
  ) {
    throw new BadRequestError("Invalid status");
  }

  const filter = status ? { verificationStatus: status } : {};

  const [licenses, pending, approved, rejected, total] = await Promise.all([
    BusinessLicense.find(filter)
      .select("-data") // ✅ exclude base64 blob
      .populate({
        path: "businessId",
        select: "companyName companyEmail role country", // ✅ keep light
      })
      .sort({ uploadedAt: -1 }) // newest first
      .lean(),
    BusinessLicense.countDocuments({ verificationStatus: "pending" }),
    BusinessLicense.countDocuments({ verificationStatus: "approved" }),
    BusinessLicense.countDocuments({ verificationStatus: "rejected" }),
    BusinessLicense.countDocuments(filter),
  ]);

  return Response.json(
    {
      success: true,
      data: licenses,
      counts: { pending, approved, rejected },
      pageInfo: { total },
    },
    { status: 200 }
  );
});


export const PATCH = withErrorHandler(async (request: NextRequest) => {
  await connect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { licenseId, verificationStatus, rejectionReason } = await parseJson<{
      licenseId?: string;
      verificationStatus?: "pending" | "approved" | "rejected";
      rejectionReason?: string;
    }>(request);

    if (!licenseId || !verificationStatus) {
      throw new BadRequestError("Missing required fields");
    }

    if (!["pending", "approved", "rejected"].includes(verificationStatus)) {
      throw new ValidationError("Invalid verificationStatus");
    }

    if (verificationStatus === "rejected" && !rejectionReason?.trim()) {
      throw new ValidationError("Rejection reason is required for rejected status");
    }

    const license = await BusinessLicense.findById(licenseId).session(session);
    if (!license) {
      throw new NotFoundError("License not found");
    }

    const verified = verificationStatus === "approved";

    const updateData: any = {
      verificationStatus,
      verifiedAt: new Date(),
      rejectionReason: verificationStatus === "rejected" ? rejectionReason?.trim() : null,
    };

    const updatedLicense = await BusinessLicense.findByIdAndUpdate(
      licenseId,
      updateData,
      { new: true, session }
    );

    const updatedBusiness = await Business.findByIdAndUpdate(
      license.businessId,
      { verified },
      { new: true, session }
    );

    await session.commitTransaction();

    return Response.json(
      { success: true, data: { updatedLicense, updatedBusiness } },
      { status: 200 }
    );
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
