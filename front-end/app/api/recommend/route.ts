// frontend/app/api/recommend/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { cleanQuery, classifyIntent, extractEntities } from "@/lib/nlp";

const AI_URL = (process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000").replace(/\/+$/, "");

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

    // C) Call FastAPI recommender
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
    });

    if (!recRes.ok) {
      const errText = await recRes.text().catch(() => "");
      console.error(`AI service error (${recRes.status}):`, errText);
      return NextResponse.json(
        { matches: [], fallbackMode: "relaxed", debug: { gemini, nlp, aiStatus: recRes.status, aiError: errText } },
        { status: 200 }
      );
    }

    const data = await recRes.json();

    return NextResponse.json({
      ...data,
      debug: { gemini, nlp },
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