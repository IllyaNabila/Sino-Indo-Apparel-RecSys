// lib/translation.ts
import axios, { AxiosError } from "axios";

export async function detectLang(text: string): Promise<"en" | "id" | "zh"> {
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  if (/\b(saya|yang|dan|dengan|untuk|bahan|harga|ini|mau|bisa|halo)\b/i.test(text)) return "id";
  return "en";
}

function norm(lang: "en" | "id" | "zh") {
  return lang === "zh" ? "zh-cn" : lang;
}

type TranslateResponse = {
  translatedText?: string;
};

export async function translateText(
  content: string,
  sourceLang: "en" | "id" | "zh",
  targetLang: "en" | "id" | "zh"
): Promise<string> {
  if (sourceLang === targetLang) return content;

  // ✅ Works in dev + Vercel (same origin)
  const url = "http://localhost:3000/api/translate";

  try {
    const res = await axios.post<TranslateResponse>(url, {
      content,
      sourceLang: norm(sourceLang),
      targetLang: norm(targetLang),
    });

    return typeof res.data?.translatedText === "string" ? res.data.translatedText : content;
  } catch (err: unknown) {
    // ✅ Narrow the error safely (no `any`)
    if (axios.isAxiosError(err)) {
      const ae = err as AxiosError<{ message?: string }>;
      console.error(
        "Translation failed:",
        ae.response?.data?.message ?? ae.message
      );
    } else if (err instanceof Error) {
      console.error("Translation failed:", err.message);
    } else {
      console.error("Translation failed:", err);
    }
    return content;
  }
}