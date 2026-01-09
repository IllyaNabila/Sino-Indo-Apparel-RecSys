import { NextResponse } from "next/server";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req: Request) {
  try {
    await connect();

    const { token, password } = await req.json();
    const rawToken = String(token || "");
    const newPassword = String(password || "");

    if (!rawToken || !newPassword) {
      return NextResponse.json({ message: "Token and password are required." }, { status: 400 });
    }
{/**
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    } */}

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: tokenHash,
      forgotPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: "Reset link is invalid or expired." }, { status: 400 });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({ message: "Password reset successful. You can log in now." });
  } catch (err: any) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
