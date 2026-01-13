import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/errors";

connect();

export const POST = withErrorHandler(async (request: NextRequest) => {
    let token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
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
      preferredLanguage: requestedPreferredLanguage,
    } = reqBody;
    console.log(reqBody);

    const allowedPreferredLanguages = new Set(["en", "id", "zh"]);

    let preferredLanguage =
      country === "china" ? "zh" : country === "indonesia" ? "id" : "en";

    if (requestedPreferredLanguage !== undefined) {
      if (!allowedPreferredLanguages.has(requestedPreferredLanguage)) {
        throw new BadRequestError("Invalid preferredLanguage");
      }
      preferredLanguage = requestedPreferredLanguage;
    }

    //check if business exists
    const business = await Business.findOne({
      registrationNumber
    });
    if (business) {
      throw new ConflictError("Business already registered");
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
      preferredLanguage,
      submittedBy: userId,
    });

    const savedBusiness = await newBusiness.save();
    console.log(savedBusiness);

    // After saving newBusiness
    const tokenData = {
      id: user._id,
      email: user.email,
      businessId: savedBusiness._id,
      verified: savedBusiness.verified,
    };

    token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: "Business created successfully",
          savedBusiness,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
    });
    
    return response
});
