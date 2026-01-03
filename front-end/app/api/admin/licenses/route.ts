import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  await connect(); //ensures both connection + model registration
  try {
    const verificationStatus = request.nextUrl.searchParams
      .get("status")
      ?.toLowerCase();
    let licenses;
    console.log(verificationStatus);

    if (!verificationStatus || verificationStatus === "all") {
      licenses = await BusinessLicense.find()
        .populate("businessId")
        .sort({ uploadedAt: 1 });
    } else {
      licenses = await BusinessLicense.find({ verificationStatus })
        .populate("businessId")
        .sort({ uploadedAt: 1 });
    }

    const totalPending = await BusinessLicense.countDocuments({
      verificationStatus: "pending",
    });
    const totalApproved = await BusinessLicense.countDocuments({
      verificationStatus: "approved",
    });
    const totalRejected = await BusinessLicense.countDocuments({
      verificationStatus: "rejected",
    });

    return NextResponse.json({
      success: true,
      data: licenses,
      counts: { totalPending, totalApproved, totalRejected },
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
  try {
    const reqBody = await request.json();
    const { licenseId, verificationStatus, rejectionReason } = reqBody;
  
    if (!licenseId || !verificationStatus) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const license = await BusinessLicense.findById({_id: licenseId});
    if (!license) return NextResponse.json({ success: false, message: "License not found"});

    const verified = verificationStatus === "approved";
    const updateData: any = {
      verificationStatus,
      verifiedAt: new Date()
    };
  
    if (verificationStatus === "rejected" && !rejectionReason) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required for rejected status" },
        { status: 400 }
      );
    }
  
    if (verificationStatus === "rejected") {
      updateData.rejectionReason = rejectionReason;
    } else {
      updateData.rejectionReason = null;
    }

    const businessId = license.businessId;

    const updatedLicense = await BusinessLicense.findByIdAndUpdate(
      { _id: licenseId },
      updateData,
      { new: true},
    );

    const updatedBusiness = await Business.findByIdAndUpdate( 
      {_id: businessId }, 
      { verified }, 
      { new: true},
    );
  
    return NextResponse.json({
      success: true, data: {updatedLicense, updatedBusiness}
    });
  } catch (error: any) {
    console.error("Error updating license:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update license" },
      { status: 500 }
    );
  }
}
