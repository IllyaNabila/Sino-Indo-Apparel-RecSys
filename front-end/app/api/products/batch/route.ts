import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import Product from '@/models/productModel'
import {connect} from '@/dbConfig/dbConfig'

connect();

export async function POST(req: NextRequest) {
    try {
        const productIds = await req.json();
       
        console.log(productIds)
        // Validate input
        if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== "string")) {
        return NextResponse.json({ error: "Invalid productIds format. Must be an array of strings." });
        }

        // Fetch products by IDs
        //const objectIds = productIds.map((id) => new ObjectId(id));
        const products = await Product.find({ _id: { $in: productIds } }).populate("businessId", "_id companyName address country");

        // Reorder products to match the sequence of productIds
        const orderedProducts = productIds.map((id) =>
            products.find((product) => product._id.toString() === id)
        );
        return NextResponse.json(orderedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}