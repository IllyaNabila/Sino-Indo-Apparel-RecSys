import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function POST(req: Request) {
  try {
    await connect();

    const { email, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json({ message: "Email and password required." }, { status: 400 });
    }

    // Only allow admin role here
    const admin = await User.findOne({ email: normalizedEmail, role: "admin" });
    if (!admin) {
      return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
    }

    const ok = await bcryptjs.compare(String(password), admin.password);
    if (!ok) {
      return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
    }

    const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
    if (!TOKEN_SECRET) {
      return NextResponse.json({ message: "Server misconfigured (TOKEN_SECRET missing)." }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: admin._id.toString(), role: "admin", email: admin.email },
      TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    const res = NextResponse.json({ message: "Admin login successful." });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return res;
  } catch {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
