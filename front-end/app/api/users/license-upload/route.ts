import {connect} from "@/dbConfig/dbConfig";
import BusinessLicense from "@/models/licenseModel"
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import Business from "@/models/businessModel";


connect()

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value || '';
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

        return NextResponse.json({
            message: "License uploaded successfully",
            success: true,
            savedLicense
        });
    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

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