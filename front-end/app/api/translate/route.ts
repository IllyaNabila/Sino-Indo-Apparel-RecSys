import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  content: string;
  targetLang: "en" | "id" | "zh" | "zh-cn";
  sourceLang?: "auto" | "en" | "id" | "zh" | "zh-cn";
};

function norm(lang: string) {
  const l = lang.toLowerCase().trim();
  if (l === "zh") return "zh-cn";     // ✅ important
  return l;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Body>;

    const text = body.content?.trim();
    const targetLang = body.targetLang ? norm(body.targetLang) : "";
    const sourceLang =
      body.sourceLang && body.sourceLang !== "auto" ? norm(body.sourceLang) : "auto";

    if (!text) return NextResponse.json({ error: "Missing 'content'." }, { status: 400 });
    if (!targetLang) return NextResponse.json({ error: "Missing 'targetLang'." }, { status: 400 });

    const mod: any = await import("translate-google");
    const translate = mod.default ?? mod;

    const translatedText: string = await translate(text, {
      from: sourceLang,
      to: targetLang,
    });

    return NextResponse.json({ translatedText, sourceLang, targetLang });
  } catch (err: any) {
    console.error("Translate route error:", err);
    return NextResponse.json({ error: err?.message ?? "Translation failed." }, { status: 500 });
  }
}
