import {connect} from "@/dbConfig/dbConfig";
import BusinessLicense from "@/models/licenseModel"
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { NotFoundError } from "@/lib/errors";


connect()
export const POST = withErrorHandler(async (request: NextRequest) => {
  let token = request.cookies.get('token')?.value || '';
  const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
  const businessId = decodedToken.businessId;
  const reqBody = await request.json();
  const {
      filename,
      mimetype,
      data
  } = reqBody;
  
  const newLicense = new BusinessLicense({
      filename,
      mimetype,
      data,
      verificationStatus: 'pending',
      businessId
  })

  const savedLicense = await newLicense.save();

  const tokenData = {
    id: decodedToken.id,
    email: decodedToken.email,
    businessId: decodedToken.businessId,
    verified: decodedToken.verified,
    licenseUploaded: true,
  };
  console.log(tokenData)

  token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
    expiresIn: "1d",
  });

  const response = NextResponse.json(
      {
        success: true,
        data: {
          message: "License uploaded successfully",
          success: true,
          savedLicense
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
    });
    
    return response
});

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const businessId = decoded.businessId;

    const body = await req.json();
    const { filename, mimetype, data } = body;

    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Optional: remove or mark previous pending license
    await BusinessLicense.deleteMany({
      businessId,
      verificationStatus: "pending",
    });

    const newLicense = await BusinessLicense.create({
      filename,
      mimetype,
      data,
      businessId,
      verificationStatus: "pending"
    });

    return NextResponse.json({ message: "License submitted", licenseStatus: "pending", licenseId: newLicense._id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const businessId = decoded.businessId;

    const latest = await BusinessLicense.findOne({ businessId })
      .sort({ uploadedAt: -1 }) // latest first

    if (!latest) {
      return NextResponse.json({ status: "none" });
    }

    return NextResponse.json({
      status: latest.verificationStatus,
      submittedDate: latest.uploadedAt,
      approvedDate: latest.verifiedAt,
      rejectionReason: latest.rejectionReason,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}