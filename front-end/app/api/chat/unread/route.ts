  import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Membership from "@/models/conversationMembershipModel";

connect();

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const userId = decodedToken.businessId;
    const conversationId = request.nextUrl.searchParams.get("conversationId");

    await Membership.findOneAndUpdate(
      { conversationId, userId },
      { $set: { unread: 0} },
      { new: true }
    );
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication token is missing" },
        { status: 401 }
      );
    }

    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const userId = decodedToken.businessId;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token or user ID not found" },
        { status: 401 }
      );
    }

    const memberships = await Membership.find({ userId }).select("conversationId unread").lean();
    const map: Record<string, number> = {};
    memberships.forEach(m => { map[m.conversationId.toString()] = m.unread || 0; });

    return NextResponse.json(map, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/chat/unread:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch unread counts" },
      { status: 500 }
    );
  }
}
