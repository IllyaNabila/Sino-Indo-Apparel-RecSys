// frontend/app/api/recommend/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

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

export async function POST(req: Request) {
  try {
    const { query, userRole, userId } = await req.json();

    // A) Layer 1: Gemini Relevance Check
    let gemini = null as null | z.infer<typeof GeminiParseSchema>;
    try {
      gemini = await parseWithGemini(query);
      if (gemini && gemini.isRelevant === false) {
        return returnOffTopicResponse(gemini);
      }
    } catch (e) {
      console.warn("Gemini parse failed, falling back to /api/nlp:", e);
    }

    // B) Layer 2: Fallback NLP + Manual Keyword Guard
    const nlpRes = await fetch(`${BASE_URL}/api/nlp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const nlp = await nlpRes.json();

    // Verification for Fallback Layer
    const hasSourcingData = nlp.materials?.length > 0 || nlp.category;
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

    // C) Call FastAPI recommender
    const recRes = await fetch(`${AI_URL}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_text: cleaned,
        query_material: material,
        query_category: category,
        query_location: location,
        userRole,
        userId,
      }),
    });

    const data = await recRes.json();

    return NextResponse.json({
      ...data,
      debug: { gemini, nlp },
    });
  } catch (e: any) {
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