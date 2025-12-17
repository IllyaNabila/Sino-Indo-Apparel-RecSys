// src/app/api/analytics/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";
import { getDashboardAnalytics } from "@/lib/analytics/getDashboardAnalytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const businessId: string | undefined = decoded?.businessId;
    if (!businessId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const data = await getDashboardAnalytics(businessId, {
      country: searchParams.get("country") ?? "all",
      region: searchParams.get("region") ?? "all",
      season: searchParams.get("season") ?? "all",
      demographic: searchParams.get("demographic") ?? "all",
    });

    return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("GET /api/analytics/dashboard error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
