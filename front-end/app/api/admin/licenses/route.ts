// /api/admin/licenses/route.ts
import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const statusParam = request.nextUrl.searchParams.get("status")?.toLowerCase();
    const status = statusParam && statusParam !== "all" ? statusParam : null;

    // pagination (optional, but strongly recommended)
    {/** 
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 10)));
    const skip = (page - 1) * limit;*/}

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

    return NextResponse.json({
      success: true,
      data: licenses,
      counts: { pending, approved, rejected },
      pageInfo: { total },
    });
  } catch (error: any) {
    console.error("Error fetching business licenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { licenseId, verificationStatus, rejectionReason } = await request.json();

    if (!licenseId || !verificationStatus) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["pending", "approved", "rejected"].includes(verificationStatus)) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Invalid verificationStatus" },
        { status: 400 }
      );
    }

    if (verificationStatus === "rejected" && !rejectionReason?.trim()) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Rejection reason is required for rejected status" },
        { status: 400 }
      );
    }

    const license = await BusinessLicense.findById(licenseId).session(session);
    if (!license) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "License not found" },
        { status: 404 }
      );
    }

    const verified = verificationStatus === "approved";

    const updateData: any = {
      verificationStatus,
      verifiedAt: new Date(),
      rejectionReason: verificationStatus === "rejected" ? rejectionReason.trim() : null,
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

    return NextResponse.json({
      success: true,
      data: { updatedLicense, updatedBusiness },
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error updating license:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update license" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
