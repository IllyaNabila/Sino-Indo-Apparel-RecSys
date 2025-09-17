import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import Preference from "@/models/preferenceModel";
import License from "@/models/licenseModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const businessId = decoded.businessId;
    const business = await Business.findById(businessId);
    const preference = await Preference.findOne({businessId: businessId});
    const license = await License.findOne({ businessId }).sort({ uploadedAt: -1 }); // get latest
    
    return NextResponse.json({
      companyInfo: {
        companyName: business.companyName,
        registrationNumber: business.registrationNumber,
        description: business.description,
        address: business.address,
        phoneNumber: business.phoneNumber,
        website: business.website,
      },
      licenseStatus: {
        status: license?.verificationStatus || "none",
        submittedDate: license?.uploadedAt?.toISOString().split("T")[0] || "",
        approvedDate: license?.verifiedAt?.toISOString().split("T")[0] || "",
        rejectionReason: license?.rejectionReason || "",
      },
      preference: {
        materialPreferences: preference.materials,
        productCategories: preference.productCategories,
        regions: preference.primaryMarkets,
        customTags: preference.customTags
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//business info patch
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decoded.id;

    const reqBody = await request.json();
    const { companyName, registrationNumber, address, phoneNumber, website, description } = reqBody;

    const updatedBusiness = await Business.findOneAndUpdate(
      { submittedBy: userId },
      {
        companyName,
        registrationNumber,
        address,
        phoneNumber,
        website,
        description,
      },
      { new: true }
    );

    if (!updatedBusiness) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Business profile updated successfully",
      updatedBusiness,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
