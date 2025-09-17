import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";

connect();

export async function POST(request: NextRequest) {
  try {
    let token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reqBody = await request.json();
    const {
      companyName,
      businessType,
      registrationNumber,
      country,
      address,
      phoneNumber,
      website,
      description,
    } = reqBody;
    console.log(reqBody);

    //check if business exists
    const business = await Business.findOne({
      registrationNumber,
      submittedBy: userId,
    });
    if (business) {
      return NextResponse.json(
        { error: "Business already registered" },
        { status: 400 }
      );
    }

    const newBusiness = new Business({
      companyName,
      businessType,
      registrationNumber,
      country,
      address,
      phoneNumber,
      website,
      description,
      role: user.role,
      submittedBy: userId,
    });

    const savedBusiness = await newBusiness.save();
    console.log(savedBusiness);

    // After saving newBusiness
    const tokenData = {
      id: user._id,
      email: user.email,
      businessId: savedBusiness._id,
    };

    token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Business created successfully",
      success: true,
      savedBusiness,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
    });
    
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
