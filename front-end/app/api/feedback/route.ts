import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Conversation from "@/models/conversationModel";
import Rating from "@/models/ratingModel";
import Product from "@/models/productModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const reviewerId = decoded.businessId;
    const reqBody = await request.json();
    let { conversationId, productId, businessRating, productRating, comment } =
      reqBody;

    // findById expects the ID directly, not an object.
    // Also, handle the case where productId might be an empty string or not provided.
    const product = productId ? await Product.findById(productId) : null;
    // If a product ID was provided but not found, it's a client error.
    if (productId && !product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    // Find the participant who is not the reviewer
    const partnerParticipant = conversation.participants.find(
      (p: any) => p._id.toString() !== reviewerId.toString()
    );
    if (!partnerParticipant) {
      return NextResponse.json(
        { error: "Partner not found in conversation participants." },
        { status: 400 }
      );
    }
    const partnerId = partnerParticipant._id;

    const ratingData: any = {
      conversationId,
      reviewerId,
      partnerId,
      businessRating,
      comment,
    };

    if (productId) {
      ratingData.productId = product._id;
      ratingData.productRating = productRating;
    }

    const rating = await Rating.create(ratingData);

    return NextResponse.json(rating, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const businessRatingSummary = await Rating.aggregate([
      {
        $match: {
          businessRating: { $ne: 0 },
        },
      },
      {
        $group: {
          _id: "$partnerId",
          avgBusinessRating: { $avg: "$businessRating" },
          businessRatingCount: { $sum: 1 },
        },
      },
    ]);

    const productRatingSummary = await Rating.aggregate([
      {
        $match: {
          productId: { $exists: true, $ne: null },
          productRating: { $ne: 0 },
        },
      },
      {
        $group: {
          _id: "$productId",
          avgProductRating: { $avg: "$productRating" },
          productRatingCount: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json(
      { businessRatingSummary, productRatingSummary },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
