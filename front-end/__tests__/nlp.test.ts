import { cleanQuery, extractEntities, classifyIntent } from "@/lib/nlp";
import { describe, test, expect } from "vitest";

describe("NLP Preprocessing Tests", () => {
  test("cleanQuery normalizes text", () => {
    expect(cleanQuery(" Cotton!! For Kids  ")).toBe("cotton for kids");
  });

  test("intent classification detects search intent", () => {
    expect(classifyIntent("looking for cotton")).toBe("search_product");
  });

  test("entity extraction identifies materials/category/attributes", () => {
    const res = extractEntities("Need breathable cotton for children wear");
    console.log("DEBUG OUTPUT:", res);

    expect(res.materials).toContain("cotton");
    expect(res.category).toBe("children wear");
    expect(res.attributes).toContain("breathable");
    });


  test("synonyms resolve to correct materials", () => {
    const res = extractEntities("Need soft cotton fabric for shirts");

    expect(res.materials).toContain("cotton");
  });

  test("no entities returns nulls", () => {
    const res = extractEntities("I like fashion");

    expect(res.materials).toBeNull();
    expect(res.category).toBeNull();
    expect(res.attributes).toBeNull();
  });
});
