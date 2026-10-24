// frontend/app/api/recommend/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { cleanQuery, classifyIntent, extractEntities } from "@/lib/nlp";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import Business from "@/models/businessModel";
import Preference from "@/models/preferenceModel";
import mongoose from "mongoose";

const DEFAULT_AI_URL =
  process.env.NODE_ENV === "production"
    ? "https://sino-indo-ai-service.onrender.com"
    : "http://localhost:8000";
const AI_URL = (process.env.NEXT_PUBLIC_AI_URL || DEFAULT_AI_URL).replace(/\/+$/, "");

// --- Domain Keywords for Fallback Layer Filtering ---
const DOMAIN_KEYWORDS = [
  "cotton", "polyester", "silk", "denim", "fabric", "textile", "shirt", "pant", 
  "apparel", "garment", "clothing", "wear", "supplier", "manufacturer", "factory", 
  "importer", "vendor", "moq", "price", "bulk", "order", "shipping", "sourcing"
];

// 1) Define the JSON you want Gemini to return
const GeminiParseSchema = z.object({
  cleaned: z.string(),
  intent: z.enum([
    "find_partner",
    "find_product",
    "compare",
    "ask_info",
    "unknown",
  ]),
  materials: z.array(z.string()),
  excludeMaterials: z.array(z.string()),
  category: z.string().nullable(),
  location: z.string().nullable(),
  attributes: z.array(z.string()),
  constraints: z.object({
    moqMin: z.number().int().nullable(),
    priceMax: z.number().nullable(),
  }),
  confidence: z.number().min(0).max(1),
  clarifyingQuestion: z.string().nullable(),
  // Added irrelevant filter for AI layer
  isRelevant: z.boolean().describe("True if query is about apparel, textiles, or sourcing. False for food, jokes, or general info.")
});

async function parseWithGemini(rawQuery: string) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_google_gemini_api_key") {
    return null;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are a STRICT query parser for a B2B apparel recommender.
    Return ONLY JSON that matches the provided schema.
    Rules:
    - Do NOT invent materials/categories. If not present, use [] or null.
    - If user excludes something (e.g., "no polyester"), put it in excludeMaterials.
    - cleaned should be the normalized query (lowercase, trimmed, no filler words, remove special characters).
    - confidence: 0..1
    - isRelevant: Set to false if the query is unrelated to the textile/apparel industry.
    User query: ${JSON.stringify(rawQuery)}
    `.trim();

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(GeminiParseSchema),
    },
  });

  const text = resp.text?.trim() ?? "{}";
  const parsed = GeminiParseSchema.parse(JSON.parse(text));
  return parsed;
}

async function fallbackMongoRecommend({
  cleaned,
  material,
  category,
  location,
  userRole,
  userId,
}: {
  cleaned: string;
  material: string | null;
  category: string | null;
  location: string | null;
  userRole: string | null;
  userId: string;
}) {
  await connect();

  const roleFilter: Record<string, any> = {};
  if (userRole?.toLowerCase() === "importer") {
    roleFilter.listingType = "offer";
  } else if (userRole?.toLowerCase() === "manufacturer") {
    roleFilter.listingType = "request";
  }

  let prefMaterials: string[] = [];
  let prefCategories: string[] = [];
  if (userId && mongoose.isValidObjectId(userId)) {
    const prefDoc: any = await Preference.findOne({ businessId: userId }).lean();
    if (prefDoc) {
      prefMaterials = prefDoc.materials_norm || [];
      prefCategories = prefDoc.productCategories_norm || [];
    }
  }

  if (location) {
    const locRegex = new RegExp(location, "i");
    const matchingBiz = await Business.find(
      { $or: [{ country: locRegex }, { address: locRegex }] },
      { _id: 1 }
    ).lean();
    if (matchingBiz.length > 0) {
      roleFilter.businessId = { $in: matchingBiz.map((b: any) => b._id) };
    }
  }

  const strictFilter: Record<string, any> = { ...roleFilter };
  if (material) strictFilter.material_norm = new RegExp(material, "i");
  if (category) strictFilter.category_norm = new RegExp(category, "i");

  let candidates: any[] = await Product.find(strictFilter).limit(50).lean();
  let fallbackMode = "none";

  if (candidates.length === 0) {
    candidates = await Product.find(roleFilter).limit(50).lean();
    fallbackMode = "relaxed";
  }

  const bizIds = Array.from(new Set(candidates.map((p) => String(p.businessId))));
  const bizDocs: any[] = await Business.find({ _id: { $in: bizIds } }).lean();
  const bizMap = new Map(bizDocs.map((b) => [String(b._id), b]));

  const terms = cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  const scored = candidates.map((p) => {
    const hay = `${p.name_norm || p.name || ""} ${p.material_norm || p.material || ""} ${
      p.category_norm || p.category || ""
    } ${p.description_norm || p.description || ""}`.toLowerCase();

    const matchedTerms = terms.filter((t) => hay.includes(t)).length;
    const sim = terms.length > 0 ? Math.min(0.95, 0.55 + (matchedTerms / terms.length) * 0.4) : 0.65;

    let hard = 0;
    if (material && (p.material_norm || p.material || "").toLowerCase().includes(material.toLowerCase())) {
      hard += 0.1;
    }
    if (category && (p.category_norm || p.category || "").toLowerCase().includes(category.toLowerCase())) {
      hard += 0.1;
    }

    let pref = 0;
    if (p.material_norm && prefMaterials.includes(p.material_norm)) pref += 0.15;
    if (p.category_norm && prefCategories.includes(p.category_norm)) pref += 0.15;

    const score = 0.65 * sim + 0.2 * hard + 0.15 * pref;
    const biz = bizMap.get(String(p.businessId));

    return {
      productId: String(p._id),
      businessId: String(p.businessId),
      name: p.name || "Apparel Product",
      material: p.material || null,
      category: p.category || null,
      country: biz?.country || null,
      score,
      similarity: sim,
      hard,
      pref,
      explanation:
        fallbackMode === "none"
          ? "Strict match with constraints (material/category/location)."
          : "Matched by product relevance and profile preferences.",
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return {
    matches: scored.slice(0, 10),
    fallbackMode,
  };
}

export async function POST(req: Request) {
  try {
    const { query, userRole, userId } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // A) Layer 1: Gemini Relevance Check
    let gemini = null as null | z.infer<typeof GeminiParseSchema>;
    try {
      gemini = await parseWithGemini(query);
      if (gemini && gemini.isRelevant === false) {
        return returnOffTopicResponse(gemini);
      }
    } catch (e) {
      console.warn("Gemini parse failed, falling back to local NLP:", e);
    }

    // B) Layer 2: Direct Fallback NLP + Manual Keyword Guard (no self HTTP fetch needed)
    const nlpCleaned = cleanQuery(query);
    const nlpIntent = classifyIntent(nlpCleaned);
    const nlpEntities = extractEntities(nlpCleaned, query);
    const nlp = { cleaned: nlpCleaned, intent: nlpIntent, ...nlpEntities };

    // Verification for Fallback Layer
    const hasSourcingData = (nlp.materials && nlp.materials.length > 0) || Boolean(nlp.category);
    const hasKeywordMatch = DOMAIN_KEYWORDS.some(k => query.toLowerCase().includes(k));

    // If both layers fail to find relevance, block the request
    if (!hasSourcingData && !hasKeywordMatch && (!gemini || gemini.intent === "unknown")) {
      return returnOffTopicResponse(nlp);
    }

    // Choose which parsed values to use
    const cleaned = gemini?.cleaned || nlp.cleaned || query;
    const material = gemini?.materials?.[0] ?? nlp.materials?.[0] ?? null;
    const category = gemini?.category ?? nlp.category ?? null;
    const location = gemini?.location ?? nlp.location ?? null;

    // C) Call FastAPI recommender (with automatic MongoDB fallback if AI service is asleep/redeploying)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const recRes = await fetch(`${AI_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_text: cleaned,
          query_material: material,
          query_category: category,
          query_location: location,
          userRole: userRole || null,
          userId: userId || "",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (recRes.ok) {
        const data = await recRes.json();
        return NextResponse.json({
          ...data,
          debug: { gemini, nlp, source: "ai_service" },
        });
      }
      console.warn(`AI service returned status ${recRes.status}, using direct MongoDB fallback.`);
    } catch (aiErr: any) {
      console.warn("AI service unreachable or timed out, using direct MongoDB fallback:", aiErr?.message);
    }

    const fallbackData = await fallbackMongoRecommend({
      cleaned,
      material,
      category,
      location,
      userRole: userRole || null,
      userId: userId || "",
    });

    return NextResponse.json({
      ...fallbackData,
      debug: { gemini, nlp, source: "mongo_fallback" },
    });
  } catch (e: any) {
    console.error("Error in /api/recommend:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function for irrelevant responses
function returnOffTopicResponse(debugInfo: any) {
  return NextResponse.json({
    matches: [],
    message: "I am your B2B sourcing assistant. I specialize in apparel, textiles, and manufacturing partners. Please try a query related to those topics.",
    debug: debugInfo
  });
}