import { describe, expect, it } from "vitest";
import { resolveSeo } from "@/lib/seo";

const computed = { title: "Computed title", description: "Computed description" };

describe("resolveSeo", () => {
  it("falls back to computed values when override is null", () => {
    expect(resolveSeo(null, computed)).toEqual({
      title: "Computed title",
      description: "Computed description",
      ogTitle: "Computed title",
      ogDescription: "Computed description",
    });
  });

  it("lets a partial override win per-field", () => {
    const resolved = resolveSeo({ meta_title: "Override title" }, computed);
    expect(resolved.title).toBe("Override title");
    expect(resolved.description).toBe("Computed description");
    // og falls back to the *resolved* title, not the computed one
    expect(resolved.ogTitle).toBe("Override title");
  });

  it("treats an empty-string override as absent", () => {
    const resolved = resolveSeo({ meta_title: "" }, computed);
    expect(resolved.title).toBe("Computed title");
  });

  it("respects an explicit og override", () => {
    const resolved = resolveSeo({ og_title: "Custom OG title" }, computed);
    expect(resolved.title).toBe("Computed title");
    expect(resolved.ogTitle).toBe("Custom OG title");
  });
});
