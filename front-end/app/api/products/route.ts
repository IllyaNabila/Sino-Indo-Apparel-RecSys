import {connect} from '@/dbConfig/dbConfig'
import { NextRequest, NextResponse } from 'next/server'
import jwt from "jsonwebtoken";
import Product from '@/models/productModel'
import Business from '@/models/businessModel';

connect();

const NEXT_PUBLIC_AI_URL = (process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000").replace(/\/+$/, "");

function normalizeText(text?: string) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest){
    try {
        let token = request.cookies.get("token")?.value || "";
        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        const businessId = decodedToken.businessId;

        const business = await Business.findOne({"_id": businessId});
        if (!business || !business.role) {
            throw new Error("Business or role not found");
        }

        const roleToListingType: Record<string, string> = {
            importer: "request",
            manufacturer: "offer",
        };

        const listingType = roleToListingType[business.role] || "unknown";

        const reqBody = await request.json();
        const {
            name,
            category,
            material,
            moq,
            priceMin,
            priceMax,
            description,
            colors,
            sizes,
            leadTime,
            images,
        } = reqBody;

        const searchText = [
            name,
            category,
            material,
            description,
        ].join(" ").toLowerCase();

        const newProduct = new Product({
            businessId,
            name,
            category,
            material,
            moq,
            priceMin,
            priceMax,
            description,
            colors,
            sizes,
            leadTime,
            listingType,
            images,
            searchText,

            name_norm: normalizeText(name),
            category_norm: normalizeText(category),
            material_norm: normalizeText(material),
            description_norm: normalizeText(description),
        });

        const savedProduct = await newProduct.save();

        const embed = await fetch(`${NEXT_PUBLIC_AI_URL}/api/embed-one`, {
        method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({productId: savedProduct._id}),
        });

        if (!embed.ok) {
            console.error("Failed to embed product:", await embed.text());
            throw new Error("Embedding failed");
        }

        return NextResponse.json(savedProduct, { status: 201});    
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, {status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const decoded: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
        const businessId = decoded.businessId;

        const id = req.nextUrl.searchParams.get("id");

        if (id) {
            // Fetch specific product by ID and businessId
            const product = await Product.findOne({_id: id}).populate("businessId", "_id companyName country");;
            if (!product) {
                return NextResponse.json({ error: "Product not found"}, {status: 404});
            }
            
            return NextResponse.json(product, { status: 200 });
        } else {
            // Fetch all products for the business
            const products = await Product.find({businessId});
            
            return NextResponse.json(products, { status: 200 });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, {status: 500});
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
        const businessId = decodedToken.businessId;

        const productId = req.nextUrl.searchParams.get("id");
        if (!productId) {
            return NextResponse.json({ error: "Missing product id" }, { status: 400 });
        }

        const body = await req.json();
        const { name,
                category,
                material,
                moq,
                priceMin,
                priceMax,
                description,
                colors,
                sizes,
                leadTime,
                images, } = body;

        const searchText = [
            name,
            category,
            material,
            description
        ].join(" ").toLowerCase();

        const updated = await Product.findOneAndUpdate(
            {_id: productId, businessId},
            {
                name,
                category,
                material,
                moq,
                priceMin,
                priceMax,
                description,
                colors,
                sizes,
                leadTime,
                images,
                searchText,
                name_norm: normalizeText(name),
                category_norm: normalizeText(category),
                material_norm: normalizeText(material),
                description_norm: normalizeText(description),
            },
            {  new: true}
        );

        console.log("updated product: ", updated);

        if (!updated) {
              return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

        const embed = await fetch(`${NEXT_PUBLIC_AI_URL}/api/embed-one`, {
        method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({productId: updated._id}),
        });

        if (!embed.ok) {
            console.error("Failed to embed product:", await embed.text());
            throw new Error("Embedding failed");
        }

        return NextResponse.json({ message: "Product updated", updated});
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
        const businessId = decodedToken.businessId;

        const productId = req.nextUrl.searchParams.get("id");
        if (!productId) {
            return NextResponse.json({ error: "Missing product id" }, { status: 400 });
        }

        const deleted = await Product.deleteOne(
            {_id: productId, businessId}
        );

        console.log("deleted product: ", deleted);
 
        if (deleted.deletedCount===0) {
              return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

        return NextResponse.json({ message: "Product deleted", deleted});
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500});
    }
}