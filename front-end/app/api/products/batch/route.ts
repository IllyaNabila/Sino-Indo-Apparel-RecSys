import { NextRequest, NextResponse } from "next/server";
import Product from '@/models/productModel';
import '@/models/businessModel';
import {connect} from '@/dbConfig/dbConfig';

export async function POST(req: NextRequest) {
    try {
        await connect();
        const productIds = await req.json();
       
        // Validate input
        if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== "string")) {
            return NextResponse.json({ error: "Invalid productIds format. Must be an array of strings." }, { status: 400 });
        }

        // Fetch products by IDs
        const products = await Product.find({ _id: { $in: productIds } }).populate("businessId", "_id companyName address country");

        // Reorder products to match the sequence of productIds
        const orderedProducts = productIds
            .map((id) => products.find((product) => product._id.toString() === id))
            .filter(Boolean);
        return NextResponse.json(orderedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}