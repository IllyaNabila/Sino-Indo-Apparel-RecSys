//lib/translation.ts
import axios from "axios";

export async function detectLang(text: string): Promise<"en" | "id" | "zh"> {
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  if (/\b(yang|dan|dengan|untuk|bahan|harga|ini)\b/i.test(text)) return "id";
  return "en";
}

function norm(lang: "en" | "id" | "zh") {
  return lang === "zh" ? "zh-cn" : lang;
}

export async function translateText(
  content: string,
  sourceLang: "en" | "id" | "zh",
  targetLang: "en" | "id" | "zh"
): Promise<string> {
  if (sourceLang === targetLang) return content;

  const url = `http://localhost:3000/api/translate`; // your current approach

  try {
    const res = await axios.post(url, {
      content,
      sourceLang: norm(sourceLang),
      targetLang: norm(targetLang),
    });

    console.log(res.data)
    return typeof res.data?.translatedText === "string" ? res.data.translatedText : content;
  } catch (err: any) {
    console.error("Translation failed:", err?.response?.data || err?.message || err);
    return content;
  }
}