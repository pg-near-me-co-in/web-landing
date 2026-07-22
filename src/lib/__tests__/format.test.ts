import { describe, expect, it } from "vitest";
import { FOOD_LABEL, PG_TYPE_LABEL, STRICTNESS_LABEL, formatPriceRange } from "@/lib/format";

describe("formatPriceRange", () => {
  it("formats a full min-max range", () => {
    expect(formatPriceRange(8000, 12000)).toBe("₹8,000 – ₹12,000");
  });

  it("formats a min-only range", () => {
    expect(formatPriceRange(8000, null)).toBe("from ₹8,000");
  });

  it("formats a max-only range", () => {
    expect(formatPriceRange(null, 12000)).toBe("up to ₹12,000");
  });

  it("returns null when neither is set", () => {
    expect(formatPriceRange(null, null)).toBeNull();
  });
});

describe("enum label completeness", () => {
  // Mirrors the `check` constraints in supabase/migrations/0001_init.sql —
  // if a future migration adds an enum value, this test catches a label
  // silently missing for it.
  it("PG_TYPE_LABEL covers every pg_type enum value", () => {
    expect(Object.keys(PG_TYPE_LABEL).sort()).toEqual(["female", "male", "unisex"]);
  });

  it("FOOD_LABEL covers every food_preference enum value", () => {
    expect(Object.keys(FOOD_LABEL).sort()).toEqual([
      "both",
      "non_veg",
      "not_provided",
      "veg",
    ]);
  });

  it("STRICTNESS_LABEL covers every house_rules_strictness enum value", () => {
    expect(Object.keys(STRICTNESS_LABEL).sort()).toEqual(["liberal", "moderate", "strict"]);
  });
});
