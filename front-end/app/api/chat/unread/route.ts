import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Membership from "@/models/conversationMembershipModel";

connect();

export async function PATCH(request: NextRequest){
  try {
    const token = request.cookies.get("token")?.value;
    const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const userId = decodedToken.businessId;
    const unreadCounts = await request.json()
    
    const updates = Object.entries(unreadCounts).map(async ([conversationId, unread]) => {
      return Membership.updateOne(
        { userId, conversationId },
        { $set: { unread }},
        { upsert: true}
      );
    });

    await Promise.all(updates);
    return NextResponse.json({ message: "Successfully update unread counts"}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
        const userId = decodedToken.businessId;

        const memberships = await Membership.find({ userId });
        const unreadCounts = memberships.reduce((acc, m) => {
          acc[m.conversationId] = m.unread || 0;
          return acc;
        }, {});
        return NextResponse.json(unreadCounts, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}