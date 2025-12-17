
// /app/api/nlp/route.ts

import { NextResponse } from "next/server";
import { cleanQuery, classifyIntent, extractEntities } from "@/lib/nlp";

// --- 4. API Route ---
export async function POST(req: Request) {
  const { query } = await req.json();

  const cleaned = cleanQuery(query);
  const intent = classifyIntent(cleaned);
  const entities = extractEntities(cleaned);

  return NextResponse.json({
    cleaned,
    intent,
    ...entities,
  });
}
