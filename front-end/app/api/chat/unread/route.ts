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
    const unreadCounts = await request.json();

    const updates = Object.entries(unreadCounts).map(
      async ([conversationId, unread]) => {
        return Membership.updateOne(
          { userId, conversationId },
          { $set: { unread } },
          { upsert: true }
        );
      }
    );

    await Promise.all(updates);
    return NextResponse.json(
      { message: "Successfully update unread counts" },
      { status: 200 }
    );
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

    const memberships = await Membership.find({ userId });
    if (!memberships) {
      return NextResponse.json(
        { error: "No memberships found for the user" },
        { status: 404 }
      );
    }

    const unreadCounts = memberships.reduce((acc, m) => {
      acc[m.conversationId] = m.unread || 0;
      return acc;
    }, {});

    return NextResponse.json(unreadCounts, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/chat/unread:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch unread counts" },
      { status: 500 }
    );
  }
}
