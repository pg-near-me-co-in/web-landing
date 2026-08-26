import { describe, expect, it } from "vitest";
import { formatINR, formatPriceRange } from "@/lib/format";

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
});
