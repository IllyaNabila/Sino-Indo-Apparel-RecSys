import {connect} from '@/dbConfig/dbConfig'
import { NextRequest, NextResponse } from 'next/server'
import jwt from "jsonwebtoken";
import Product from '@/models/productModel'

connect();

export async function POST(request: NextRequest){
    try {
        let token = request.cookies.get("token")?.value || "";
        const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        const businessId = decodedToken.businessId;

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
            images
        } = reqBody;

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
            images,
        });

        const savedProduct = await newProduct.save();
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
        console.log("hello id:", id);

        if (id) {
            // Fetch specific product by ID and businessId
            const product = await Product.findOne({_id: id, businessId});
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
            },
            {  new: true}
        );

        console.log("updated product: ", updated);

        if (!updated) {
              return NextResponse.json({ error: "Product not found" }, { status: 404 });
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