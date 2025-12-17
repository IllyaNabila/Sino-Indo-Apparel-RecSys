import textileEntities from "@/data/textile_entities.json";

// Define a type for the structure of your JSON data
interface TextileEntities {
  MATERIALS: string[];
  CATEGORY: string[];
  ATTRIBUTES: string[];
  LOCATIONS: string[];
  MATERIAL_SYNONYMS: Record<string, string[]>;
}

export function cleanQuery(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/childrens/g, "children")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyIntent(text: string) {
  if (
    text.includes("need") ||
    text.includes("find") ||
    text.includes("looking")
  )
    return "search_product";

  if (text.includes("recommend") || text.includes("suggest"))
    return "recommendation";

  if (text.includes("offer") || text.includes("supply")) return "list_offer";

  return "unknown";
}

const CATEGORY_RULES = [
  { regex: /t-?shirts?/i, value: "tshirts" },
  { regex: /hoodies?/i, value: "hoodies" },
  { regex: /uniforms?/i, value: "uniforms" },
  { regex: /hijabs?/i, value: "hijabs" },
  { regex: /dresses|dress/i, value: "dresses" },
  { regex: /childrens?\s*wear/i, value: "children wear" },
  { regex: /kids?\s*wear/i, value: "kids wear" },
  { regex: /mens?\s*wear/i, value: "menswear" },
  { regex: /womens?\s*wear/i, value: "womenswear" },
  { regex: /sports?\s*wear/i, value: "sportswear" },
  { regex: /outer\s*wear/i, value: "outerwear" },
  { regex: /active\s*wear/i, value: "activewear" },
  { regex: /baby\s*clothes/i, value: "baby clothes" },
  { regex: /sleep\s*wear/i, value: "sleepwear" },
];

export function extractEntities(text: string) {
  // Cast the imported JSON to the new type
  const {
    MATERIALS,
    CATEGORY,
    ATTRIBUTES,
    LOCATIONS,
    MATERIAL_SYNONYMS,
  }: TextileEntities = textileEntities as any;

  const foundMaterials = [];

  // Synonyms
  for (const key of Object.keys(MATERIAL_SYNONYMS)) {
    const synonyms = MATERIAL_SYNONYMS[key];
    if (synonyms.some((term: string) => text.includes(term))) {
      foundMaterials.push(key);
    }
  }

  MATERIALS.forEach((m: string) => {
    if (text.includes(m)) foundMaterials.push(m);
  });

  const cleanedMaterials =
    foundMaterials.length > 0 ? Array.from(new Set(foundMaterials)) : null;

  let foundCategory = null;
  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(text)) {
      foundCategory = rule.value;
      break;
    }
  }

  if (!foundCategory) {
    foundCategory =
      CATEGORY.find((c) => text.includes(c.replace(/\s+/g, ""))) ||
      CATEGORY.find((c) => text.includes(c)) ||
      null;
  }

  const foundAttributes = ATTRIBUTES.filter((a) => text.includes(a));

  const foundLocation = LOCATIONS.find((l) => text.includes(l)) || null;

  return {
    materials: cleanedMaterials,
    category: foundCategory,
    location: foundLocation,
    attributes: foundAttributes.length ? foundAttributes : null,
  };
}
