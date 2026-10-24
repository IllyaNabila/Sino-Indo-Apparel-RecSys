// /lib/nlp.ts
import textileEntities from "@/data/textile_entities.json";

// --- Types ---
interface BusinessKeywords {
  SERVICES: string[];
  INCOTERMS: string[];
  CERTIFICATIONS: string[];
  TRADE_TERMS: string[];
  PAYMENT: string[];
}

interface TextileEntities {
  MATERIALS: string[];
  CATEGORY: string[];
  ATTRIBUTES: string[];
  LOCATIONS: string[];
  MATERIAL_SYNONYMS: Record<string, string[]>;
  BUSINESS_KEYWORDS?: BusinessKeywords; // ✅ optional (won’t break if JSON not updated yet)
}

type PriceRange = {
  min: number | null;
  max: number | null;
  currency: string | null;
};

function detectCurrency(raw: string): string | null {
  const lower = raw.toLowerCase();

  if (lower.includes("$")) return "usd";
  if (/\busd\b/.test(lower)) return "usd";
  if (/\bidr\b/.test(lower)) return "idr";
  if (/\bcny\b/.test(lower) || /¥/.test(raw)) return "cny";
  if (/\brm\b/.test(lower) || /\bmyr\b/.test(lower)) return "rm";

  return null;
}

// --- Helpers ---
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// matches terms with word boundaries + supports spaces/hyphens between words
function hasTerm(text: string, term: string) {
  const t = term.trim().toLowerCase();
  if (!t) return false;

  // turn "oeko tex" into pattern "oeko[\s-]+tex"
  const parts = t.split(/\s+/).map(escapeRegex);
  const phrase = parts.join("[\\s-]+");

  const re = new RegExp(`\\b${phrase}\\b`, "i");
  return re.test(text);
}

function findMatches(text: string, terms: string[]) {
  return terms.filter((t) => hasTerm(text, t));
}

// --- Main ---
export function cleanQuery(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ") // keep hyphen so "oeko-tex" survives as "oeko-tex"
    .replace(/childrens/g, "children")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyIntent(text: string) {
  if (/\b(need|find|looking for|search)\b/i.test(text)) return "search_product";
  if (/\b(recommend|suggest)\b/i.test(text)) return "recommendation";
  if (/\b(offer|supply)\b/i.test(text)) return "list_offer";
  return "unknown";
}

const CATEGORY_RULES = [
  { regex: /\bt-?shirts?\b/i, value: "tshirts" },
  { regex: /\bhoodies?\b/i, value: "hoodies" },
  { regex: /\buniforms?\b/i, value: "uniforms" },
  { regex: /\bhijabs?\b/i, value: "hijabs" },
  { regex: /\bdresses?\b/i, value: "dresses" },
  { regex: /\bchildrens?\s*wear\b/i, value: "children wear" },
  { regex: /\bkids?\s*wear\b/i, value: "kids wear" },
  { regex: /\bmens?\s*wear\b/i, value: "menswear" },
  { regex: /\bwomens?\s*wear\b/i, value: "womenswear" },
  { regex: /\bsports?\s*wear\b/i, value: "sportswear" },
  { regex: /\bouter\s*wear\b/i, value: "outerwear" },
  { regex: /\bactive\s*wear\b/i, value: "activewear" },
  { regex: /\bbaby\s*clothes\b/i, value: "baby clothes" },
  { regex: /\bsleep\s*wear\b/i, value: "sleepwear" },
];

// (Optional) simple B2B numeric extraction
function extractMOQ(text: string): number | null {
  const m =
    text.match(/\bmoq\s*(\d{1,7})\b/i) ||
    text.match(/\bminimum\s*order\s*(\d{1,7})\b/i) ||
    text.match(/\bmin(?:imum)?\s*(\d{1,7})\s*(pcs|pieces)?\b/i);
  return m ? Number(m[1]) : null;
}

function extractPriceRange(cleanedText: string, rawText?: string): PriceRange | null {
  const raw = rawText ?? cleanedText;
  const currency = detectCurrency(raw) ?? detectCurrency(cleanedText);

  // 1) "under $20", "below 20", "less than 20", "<= 20", "< 20"
  const maxOnly =
    raw.match(/\b(under|below|less than|less)\s*\$?\s*(\d+(?:\.\d+)?)\b/i) ||
    raw.match(/(?:<=|<)\s*\$?\s*(\d+(?:\.\d+)?)/i);

  if (maxOnly) {
    const num = maxOnly[2] ?? maxOnly[1]; // depends on which regex matched
    return { min: null, max: Number(num), currency };
  }

  // 2) "10-15 usd"
  const range1 = raw.match(/\b(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(usd|idr|cny|rm|myr)?\b/i);
  if (range1) {
    const cur = (range1[3] || currency || null)?.toLowerCase() || null;
    return { min: Number(range1[1]), max: Number(range1[2]), currency: cur };
  }

  // 3) "usd 5 to 8"
  const range2 = raw.match(/\b(usd|idr|cny|rm|myr)\s*(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)\b/i);
  if (range2) {
    const cur = (range2[1] || currency || null)?.toLowerCase() || null;
    return { min: Number(range2[2]), max: Number(range2[3]), currency: cur };
  }

  // 4) "5 to 8 usd"
  const range3 = raw.match(/\b(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)\s*(usd|idr|cny|rm|myr)\b/i);
  if (range3) {
    const cur = (range3[3] || currency || null)?.toLowerCase() || null;
    return { min: Number(range3[1]), max: Number(range3[2]), currency: cur };
  }

  return null;
}

export function extractEntities(text: string, rawText?: string) {
  const {
    MATERIALS,
    CATEGORY,
    ATTRIBUTES,
    LOCATIONS,
    MATERIAL_SYNONYMS,
    BUSINESS_KEYWORDS,
  } = textileEntities as unknown as TextileEntities;

  // --- Materials (dedup + canonical synonym keys) ---
  const materialSet = new Set<string>();

  for (const key of Object.keys(MATERIAL_SYNONYMS || {})) {
    const synonyms = MATERIAL_SYNONYMS[key] || [];
    if (synonyms.some((term) => hasTerm(text, term))) materialSet.add(key);
  }

  (MATERIALS || []).forEach((m) => {
    if (hasTerm(text, m)) materialSet.add(m);
  });

  const materials = materialSet.size ? Array.from(materialSet) : null;

  // --- Category ---
  let category: string | null = null;

  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(text)) {
      category = rule.value;
      break;
    }
  }

  if (!category) {
    category = (CATEGORY || []).find((c) => hasTerm(text, c)) || null;
  }

  // --- Attributes + Location ---
  const attributesArr = (ATTRIBUTES || []).filter((a) => hasTerm(text, a));
  const attributes = attributesArr.length ? attributesArr : null;

  const location = (LOCATIONS || []).find((l) => hasTerm(text, l)) || null;

  // --- Business keywords (optional) ---
  const bk = BUSINESS_KEYWORDS || {
    SERVICES: [],
    INCOTERMS: [],
    CERTIFICATIONS: [],
    TRADE_TERMS: [],
    PAYMENT: [],
  };

  const services = findMatches(text, bk.SERVICES);
  const incoterms = findMatches(text, bk.INCOTERMS);
  const certifications = findMatches(text, bk.CERTIFICATIONS);
  const tradeTerms = findMatches(text, bk.TRADE_TERMS);
  const payment = findMatches(text, bk.PAYMENT);

  const business =
    services.length || incoterms.length || certifications.length || tradeTerms.length || payment.length
      ? {
          services: services.length ? services : null,
          incoterms: incoterms.length ? incoterms : null,
          certifications: certifications.length ? certifications : null,
          tradeTerms: tradeTerms.length ? tradeTerms : null,
          payment: payment.length ? payment : null,
        }
      : null;

  // --- Optional numeric extractions ---
  const moq = extractMOQ(text);
  const priceRange = extractPriceRange(text, rawText);

  return {
    materials,
    category,
    location,
    attributes,
    business,      
    moq,           
    priceRange,    
  };
}
