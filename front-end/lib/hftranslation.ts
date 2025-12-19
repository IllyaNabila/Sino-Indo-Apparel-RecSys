export async function translateWithHF(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  // Skip if same language
  if (sourceLang === targetLang) return text;

  const res = await fetch(
    "https://api-inference.huggingface.co/models/google/madlad400-3b-mt",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          source_language: sourceLang,
          target_language: targetLang,
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("HF translation failed:", await res.text());
    return text; // graceful fallback
  }

  const data = await res.json();

  // HF usually returns [{ translation_text: "..." }]
  return data?.[0]?.translation_text ?? text;
}
