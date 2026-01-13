// /app/api/nlp/route.ts
import { NextResponse } from "next/server";
import { cleanQuery, classifyIntent, extractEntities } from "@/lib/nlp";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query : "";

    if (!query.trim()) {
      return NextResponse.json(
        { error: "Missing or empty query." },
        { status: 400 }
      );
    }

    const cleaned = cleanQuery(query);
    const intent = classifyIntent(cleaned);
    const entities = extractEntities(cleaned, query);

    return NextResponse.json({ cleaned, intent, ...entities });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to process NLP request." },
      { status: 500 }
    );
  }
}
