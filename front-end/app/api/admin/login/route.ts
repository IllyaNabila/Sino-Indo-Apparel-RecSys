import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { AppError, BadRequestError, UnauthorizedError } from "@/lib/errors";
import { withErrorHandler } from "@/lib/withErrorHandler";

export const POST = withErrorHandler(async (req: Request) => {
    await connect();

    const { email, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new BadRequestError("Email and password required.");
    }

    // Only allow admin role here
    const admin = await User.findOne({ email: normalizedEmail, role: "admin" });
    if (!admin) {
      throw new UnauthorizedError("Invalid admin credentials.");
    }

    const ok = await bcryptjs.compare(String(password), admin.password);
    if (!ok) {
      throw new UnauthorizedError("Invalid admin credentials.");
    }

    const TOKEN_SECRET = process.env.TOKEN_SECRET || "";
    if (!TOKEN_SECRET) {
       throw new AppError("Server misconfigured (TOKEN_SECRET missing).", 500);
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
});
