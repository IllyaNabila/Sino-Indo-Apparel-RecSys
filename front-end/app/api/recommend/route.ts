// frontend/app/api/recommend/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

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

    // A) Try Gemini first
    let gemini = null as null | z.infer<typeof GeminiParseSchema>;
    {
      /**try {
      gemini = await parseWithGemini(query);
      console.log("gemini:", gemini);
    } catch (e) {
      console.warn("Gemini parse failed, falling back to /api/nlp:", e);
    }*/
    }

    // B) Fallback: your existing rule-based NLP
    const nlpRes = await fetch(`${BASE_URL}/api/nlp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const nlp = await nlpRes.json();
    console.log("nlp:", nlp);

    // Choose which parsed values to use
    const cleaned = gemini?.cleaned || nlp.cleaned || query;
    const material = gemini?.materials?.[0] ?? nlp.materials?.[0] ?? null;
    const category = gemini?.category ?? nlp.category ?? null;
    const location = gemini?.location ?? nlp.location ?? null;

    // (Optional) keep this if you really need it every request
    const embedall = await fetch(`${AI_URL}/api/embed-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const embed = await embedall.json();
    console.log("embed:", embed);

    // C) Call FastAPI recommender (same payload as your current code)
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

    // Optionally attach what Gemini understood (handy for debugging)
    return NextResponse.json({
      ...data,
      debug: {
        gemini,
        nlp,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
