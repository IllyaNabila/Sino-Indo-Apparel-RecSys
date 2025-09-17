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
            
            return NextResponse.json(product);
        } else {
            // Fetch all products for the business
            const products = await Product.find({businessId});
            if (!products || products.length === 0) {
                console.log("error");
                return NextResponse.json(   
                    { error: "Product not found"},
                    { status: 404}
                );
            }
            console.log("products");
            return NextResponse.json(products);
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, {status: 500});
    }
}

