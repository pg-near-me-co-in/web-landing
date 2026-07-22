import { describe, expect, it } from "vitest";
import { resolveSeo } from "@/lib/seo";

const computed = { title: "Computed title", description: "Computed description" };

describe("resolveSeo", () => {
  it("uses computed values when there is no override", () => {
    const result = resolveSeo(null, computed);
    expect(result.title).toBe("Computed title");
    expect(result.description).toBe("Computed description");
    expect(result.ogTitle).toBe("Computed title");
    expect(result.ogDescription).toBe("Computed description");
  });

  it("prefers an override title/description over computed", () => {
    const result = resolveSeo(
      { meta_title: "Override title", meta_description: "Override description", og_title: null, og_description: null },
      computed
    );
    expect(result.title).toBe("Override title");
    expect(result.description).toBe("Override description");
  });

  it("falls through per-field, not all-or-nothing", () => {
    const result = resolveSeo(
      { meta_title: "Override title", meta_description: null, og_title: null, og_description: null },
      computed
    );
    expect(result.title).toBe("Override title");
    expect(result.description).toBe("Computed description");
  });

  it("defaults og fields to the resolved title/description, not the raw computed ones", () => {
    const result = resolveSeo(
      { meta_title: "Override title", meta_description: null, og_title: null, og_description: null },
      computed
    );
    expect(result.ogTitle).toBe("Override title");
    expect(result.ogDescription).toBe("Computed description");
  });

  it("uses explicit og overrides when present", () => {
    const result = resolveSeo(
      { meta_title: null, meta_description: null, og_title: "OG title", og_description: "OG description" },
      computed
    );
    expect(result.ogTitle).toBe("OG title");
    expect(result.ogDescription).toBe("OG description");
  });

  it("treats an empty-string override as absent, never returning an empty string", () => {
    const result = resolveSeo(
      { meta_title: "", meta_description: "", og_title: "", og_description: "" },
      computed
    );
    expect(result.title).toBe("Computed title");
    expect(result.description).toBe("Computed description");
    expect(result.ogTitle).toBe("Computed title");
    expect(result.ogDescription).toBe("Computed description");
  });
});
