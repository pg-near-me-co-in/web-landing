import { describe, expect, it } from "vitest";
import { THEME_DEFAULTS, themeCss } from "@/lib/theme";

describe("themeCss", () => {
  it("returns an empty string when every value matches the defaults", () => {
    expect(themeCss({ ...THEME_DEFAULTS })).toBe("");
  });

  it("emits only the overridden key when a single value differs", () => {
    const css = themeCss({ ...THEME_DEFAULTS, "theme.primary_color": "#111111" });
    expect(css).toBe(":root{--brand-primary:#111111;}");
  });

  it("emits multiple overrides together", () => {
    const css = themeCss({
      ...THEME_DEFAULTS,
      "theme.primary_color": "#111111",
      "theme.teal": "#222222",
    });
    expect(css).toContain("--brand-primary:#111111;");
    expect(css).toContain("--brand-teal:#222222;");
  });

  it("ignores keys that aren't part of THEME_DEFAULTS", () => {
    const css = themeCss({ ...THEME_DEFAULTS, "theme.unknown_key": "#333333" });
    expect(css).toBe("");
  });

  it("returns an empty string for an empty settings object", () => {
    expect(themeCss({})).toBe("");
  });
});
