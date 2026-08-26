import { describe, expect, it } from "vitest";
import { formatINR, formatPriceRange, foodLabel, genderLabel, rulesLabel } from "@/lib/format";

describe("formatINR", () => {
  it("formats a whole rupee amount with no decimals", () => {
    expect(formatINR(7000)).toBe("₹7,000");
  });
});

describe("formatPriceRange", () => {
  it("formats a range with an en-dash and /mo suffix", () => {
    expect(formatPriceRange(7000, 9500)).toBe("₹7,000 – ₹9,500/mo");
  });

  it("formats a single price (min === max) without a range", () => {
    expect(formatPriceRange(8000, 8000)).toBe("₹8,000/mo");
  });

  it("falls back to a plain-language placeholder when price is unknown", () => {
    expect(formatPriceRange(null, null)).toBe("Contact for price");
    expect(formatPriceRange(7000, null)).toBe("Contact for price");
  });
});

describe("null-safe field labels", () => {
  it("fall back to 'Not specified' when the listing doesn't have this field", () => {
    expect(genderLabel(null)).toBe("Not specified");
    expect(foodLabel(null)).toBe("Not specified");
    expect(rulesLabel(null)).toBe("Not specified");
  });

  it("still return the normal label when the field is present", () => {
    expect(genderLabel("female")).toBe("Female only");
    expect(foodLabel("veg_only")).toBe("Veg only");
    expect(rulesLabel("strict")).toBe("Strict");
  });
});
