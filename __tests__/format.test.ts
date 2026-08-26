import { describe, expect, it } from "vitest";
import { formatPriceRange } from "@/lib/format";

describe("formatPriceRange", () => {
  it("formats a full range", () => {
    expect(formatPriceRange(7000, 9500)).toBe("₹7,000 – ₹9,500");
  });

  it("formats a min-only price as 'from'", () => {
    expect(formatPriceRange(7000, null)).toBe("from ₹7,000");
  });

  it("formats a max-only price as 'up to'", () => {
    expect(formatPriceRange(null, 9500)).toBe("up to ₹9,500");
  });

  it("returns null when both are missing", () => {
    expect(formatPriceRange(null, null)).toBeNull();
  });
});
