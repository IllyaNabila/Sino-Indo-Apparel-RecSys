import { connect } from "@/dbConfig/dbConfig";
import Message from "@/models/messageModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "_id companyName")
      .populate("receiverId", "_id companyName");
    console.log(messages);
    return NextResponse.json(messages, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
