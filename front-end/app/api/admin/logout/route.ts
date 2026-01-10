import { withErrorHandler } from "@/lib/withErrorHandler";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async() => 
  {
    const res = NextResponse.json(
      { succses: true, data: { message: "Logged out" } },
      { status: 200 }
    );
  
    // Clear the auth cookie
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  
    return res;
  }
);
