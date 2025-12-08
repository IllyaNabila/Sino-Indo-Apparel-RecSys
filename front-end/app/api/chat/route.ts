import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Conversation from "@/models/conversationModel";
import Membership from "@/models/conversationMembershipModel";
import Message from "@/models/messageModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const senderId = decoded.businessId;

    const reqBody = await request.json();
    const { receiverId, content, productContext } = reqBody;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isEnded: false, // New conversations are not ended
        productContext: productContext,
        feedbackForm: "inActive",
      });

      await Membership.create([
        { userId: senderId, conversationId: conversation._id },
        { userId: receiverId, conversationId: conversation._id },
      ]);
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
      isEnded: false, // A new message re-opens the conversation
      productContext: productContext, // Update product context if provided
      feedbackForm: "inActive",
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const senderId = decoded.businessId;

    const memberships = await Membership.find({ userId: senderId });
    const conversationIds = memberships.map((m) => m.conversationId);

    const conversations = await Conversation.find({
      _id: { $in: conversationIds },
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "_id companyName")
      .populate("lastMessageId", "_id senderId content");

    const formattedConversations = conversations.map((conversation: any) => {
      const otherParticipants = conversation.participants.filter(
        (p: any) => p._id.toString() !== senderId.toString()
      );

      return {
        _id: conversation._id,
        partner: otherParticipants[0],
        lastMessageId: conversation.lastMessageId,
        lastMessageAt: conversation.lastMessageAt,
        isEnded: conversation.isEnded, // A new message re-opens the conversation
        productContext: conversation.productContext, // Update product context if provided
        feedbackForm: conversation.feedbackForm,
      };
    });

    return NextResponse.json(formattedConversations, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    const reqBody = await request.json();
    const { isEnded, productContext, feedbackForm } = reqBody;

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { isEnded, productContext, feedbackForm } },
      { new: true }
    );

    if (!updatedConversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedConversation, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
