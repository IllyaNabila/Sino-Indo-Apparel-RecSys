import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  await connect(); //ensures both connection + model registration
  try {
    const verificationStatus = request.nextUrl.searchParams.get("status")?.toLowerCase();
    let licenses; 
    console.log(verificationStatus);

    if (!verificationStatus || verificationStatus === "all") {
      licenses = await BusinessLicense.find().populate("businessId").sort({ uploadedAt: 1 });
    } else {
      licenses = await BusinessLicense.find({ verificationStatus }).populate("businessId").sort({ uploadedAt: 1 });
    }
    
    return NextResponse.json({ success: true, data: licenses });
  } catch (error: any) {
    console.error("Error fetching business licenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {}
