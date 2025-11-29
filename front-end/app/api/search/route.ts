// app/api/nlp/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Product from "@/models/productModel";

const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;
const HF_API_BASE = "https://api-inference.huggingface.co/models";

const queryModel = async (model: string, payload: any) => {
  const res = await fetch(`${HF_API_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log(res);
  if (!res.ok) throw new Error(`HF error: ${res.statusText}`);
  return res.json();
};

const classifyIntent = async (text: string) => {
  const result = await queryModel("facebook/bart-large-mnli", {
    inputs: text,
    parameters: {
      candidate_labels: [
        "find_product",
        "find_supplier",
        "compare_price",
        "ask_info",
      ],
    },
  });
  return result?.labels?.[0] || "unknown";
};

const extractEntities = async (text: string) => {
  const result = await queryModel("dslim/bert-base-NER", {
    inputs: text,
  });
  return Array.isArray(result)
    ? result.map((e: any) => e.word).filter(Boolean)
    : [];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query;

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const intent = await classifyIntent(query);
    const entities = await extractEntities(query);

    return NextResponse.json({
      intent,
      entities,
      message: `Intent: ${intent}, Entities: ${entities.join(", ")}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const businessId = decodedToken.businessId;

    const query = req.nextUrl.searchParams.get("material");
    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    let q = query.trim().toLowerCase();
    q = q.replace(/[^\w\s]/gi, "");  // remove symbols
    q = q.replace(/\s+/g, " ");      // normalize spaces
    const regex = new RegExp(q, "i");

    // Search for documents where either:
    // 1. The 'searchText' field exists and matches the query.
    // 2. The 'searchText' field does NOT exist, and the query matches one of the fallback fields.
    const results = await Product.find({
      $or: [
        { searchText: { $exists: true, $regex: regex } },
        {
          searchText: { $exists: false },
          $or: [
            { name: regex },
            { category: regex },
            { material: regex },
            { description: regex },
            { colors: regex },
          ],
        },
      ],
    }).populate("businessId", "_id companyName country");
    console.log("filter result:", results);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
