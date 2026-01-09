import { connect } from "@/dbConfig/dbConfig";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const parts = request.nextUrl.pathname.split("/");
    const id = parts[parts.length - 1];

    const license = await BusinessLicense.findById(id);

    if (!license) {
      return NextResponse.json(
        { success: false, message: "License not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: license });
  } catch (error: any) {
    console.error("Error fetching license:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch license" },
      { status: 500 }
    );
  }
}
