import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Business from "@/models/businessModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json().catch(() => null);

    if (!reqBody) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const email = String(reqBody.email ?? "").trim().toLowerCase();
    const password = String(reqBody.password ?? "");

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // (Optional) simple email format check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    // Use same generic message to avoid user enumeration
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Find associated business (optional relationship)
    const business = await Business.findOne({ submittedBy: user._id });

    // Create token payload
    const tokenData: any = { id: user._id, email: user.email };
    if (business?._id) tokenData.businessId = business._id;

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      console.error("TOKEN_SECRET is missing");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const token = jwt.sign(tokenData, secret, { expiresIn: "1d" });

    const res = NextResponse.json(
      {
        message: "Login successful",
        success: true,
        businessId: business?._id ?? null,
        companyName: business?.companyName ?? null,
        businessObject: business ?? null,
      },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });

    return res;
  } catch (error: any) {
    // Server-side log, client gets safe message
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
