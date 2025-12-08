import { connect } from "@/dbConfig/dbConfig";
import Conversation from "@/models/conversationModel";
import Message from "@/models/messageModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
 
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .populate("senderId", "_id companyName")
      .populate("receiverId", "_id companyName");
    return NextResponse.json(messages, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const senderId = decoded.businessId;

    const reqBody = await request.json();
    const { receiverId, content} = reqBody;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    });

    if (!conversation) {
      return NextResponse.json("Conversation not found", { status: 400 });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageId: message._id,
      lastMessageAt: message.sentAt,
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
