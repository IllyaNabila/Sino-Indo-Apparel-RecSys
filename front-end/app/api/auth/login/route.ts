import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  AppError,
  BadRequestError,
  ForbiddenError,
  InvalidJsonError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors";
import { withErrorHandler } from "@/lib/withErrorHandler";
import BusinessLicense from "@/models/licenseModel";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await connect();

  const reqBody = await request.json().catch((e) => {
    throw new InvalidJsonError(e);
  }); 

  const email = String(reqBody.email ?? "").trim().toLowerCase();
  const password = String(reqBody.password ?? "");

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.role === "admin") {
    throw new ForbiddenError("You don't have access.");
  }

  const validPassword = await bcryptjs.compare(password, user.password);
  if (!validPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const business = await Business.findOne({ submittedBy: user._id });

  const tokenData = {
    id: String(user._id),
    email: user.email,

    // defaults (important)
    businessId: business?._id ? String(business._id) : "",
    verified: business?.verified === true,
    licenseUploaded: false,
  };

  if (business) {
    const license = await BusinessLicense.findOne({ businessId: business._id });
    tokenData.licenseUploaded = !!license; // true if found
  }

  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    throw new AppError("Server misconfigured (TOKEN_SECRET missing).", 500);
  }

  const token = jwt.sign(tokenData, secret, { expiresIn: "1d" });

  const res = NextResponse.json(
    {
      success: true,
      data: {
        message: "Login successful",
        businessId: business?._id ?? null,
        companyName: business?.companyName ?? null,
        businessObject: business ?? null,
      },
    },
    { status: 200 }
  );

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
});
