import { describe, expect, it } from "vitest";
import { CITY_CARD_BG, cityHeroTreatment, placeholderPhotoFor } from "@/lib/placeholder-images";

describe("cityHeroTreatment", () => {
  it("is deterministic for the same slug", () => {
    expect(cityHeroTreatment("bengaluru")).toBe(cityHeroTreatment("bengaluru"));
  });

  it("stays within the CITY_CARD_BG index range", () => {
    for (const slug of ["bengaluru", "pune", "vadodara", "mumbai", "delhi-ncr", ""]) {
      const idx = cityHeroTreatment(slug);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(CITY_CARD_BG.length);
    }
  });

  it("does not throw on an empty slug", () => {
    expect(() => cityHeroTreatment("")).not.toThrow();
  });
});

describe("placeholderPhotoFor", () => {
  it("is deterministic for the same listing id", () => {
    expect(placeholderPhotoFor("abc-123")).toBe(placeholderPhotoFor("abc-123"));
  });

  it("covers all 4 placeholder buckets across a sample of ids", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(placeholderPhotoFor(`listing-${i}`));
    }
    expect(seen.size).toBe(4);
  });

  it("does not throw on an empty id", () => {
    expect(() => placeholderPhotoFor("")).not.toThrow();
  });
});
