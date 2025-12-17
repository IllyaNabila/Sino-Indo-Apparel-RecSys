import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Conversation from "@/models/conversationModel";
import Rating from "@/models/ratingModel";
import Product from "@/models/productModel";
import mongoose from "mongoose";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { businessIds, productIds } = reqBody;
    console.log(reqBody);

    const businessMatch: any = {
      businessRating: { $ne: 0 },
    };

    if (Array.isArray(businessIds) && businessIds.length > 0) {
      const validBusinessIds = businessIds
        .filter((id: string) => mongoose.isValidObjectId(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));
      businessMatch.partnerId = {
        $in: validBusinessIds,
      };
    }

    const businessRatingSummary = await Rating.aggregate([
      {
        $match: businessMatch,
      },
      {
        $group: {
          _id: "$partnerId",
          avgBusinessRating: { $avg: "$businessRating" },
          businessRatingCount: { $sum: 1 },
        },
      },
    ]);

    const productMatch: any = {
      productId: { $exists: true, $ne: null },
      productRating: { $ne: 0 },
    };

    if (Array.isArray(productIds) && productIds.length > 0) {
      const validProductIds = productIds
        .filter((id: string) => mongoose.isValidObjectId(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));
      productMatch.productId = {
        $in: validProductIds,
      };
    } 

    const productRatingSummary = await Rating.aggregate([
      {
        $match: productMatch,
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
