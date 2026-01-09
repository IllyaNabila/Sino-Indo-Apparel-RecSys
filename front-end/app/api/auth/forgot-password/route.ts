import { NextResponse } from "next/server";
import crypto from "crypto";
import { connect } from "@/dbConfig/dbConfig"; // change to your db connect file
import User from "@/models/userModel";         // change path to your User model
import { sendResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connect();

    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Generic response to avoid user enumeration
    const generic = NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });

    if (!normalizedEmail) return NextResponse.json({ message: "Email is required." }, { status: 400 });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return generic;

    // Raw token (send via email)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token for DB storage (safer if DB leaks)
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Expiry 30 minutes
    const expiry = new Date(Date.now() + 30 * 60 * 1000);

    user.forgotPasswordToken = tokenHash;
    user.forgotPasswordTokenExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${rawToken}`;

    // ✅ Send email (recommended) — or console.log for dev
    if (!process.env.SMTP_HOST) {
      console.log("[DEV] Reset link:", resetLink);
    } else {
      // If you already have mailer helper, call it here
      await sendResetEmail(user.email, resetLink);
    }

    return generic;
  } catch (err: any) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
