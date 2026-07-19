import "server-only";
import { db } from "./db";

// Runtime theme from `site_settings` (Phase 3): admin-editable brand colors
// without a redeploy. Falls back to the Figma palette defaults.
export const THEME_DEFAULTS: Record<string, string> = {
  "theme.primary_color": "#534AB7",
  "theme.purple": "#7F77DD",
  "theme.accent": "#AFA9EC",
  "theme.teal": "#1D9E75",
  "theme.highlight": "#5DCAA5",
};

const CSS_VAR: Record<string, string> = {
  "theme.primary_color": "--brand-primary",
  "theme.purple": "--brand-purple",
  "theme.accent": "--brand-accent",
  "theme.teal": "--brand-teal",
  "theme.highlight": "--brand-highlight",
};

export async function getThemeSettings(): Promise<Record<string, string>> {
  try {
    const { rows } = await db.query(
      `select key, value from site_settings where key like 'theme.%'`
    );
    const out = { ...THEME_DEFAULTS };
    for (const r of rows) {
      const v = typeof r.value === "string" ? r.value : String(r.value);
      if (r.key in out && /^#[0-9a-fA-F]{6}$/.test(v)) out[r.key] = v;
    }
    return out;
  } catch {
    return { ...THEME_DEFAULTS };
  }
}

/** CSS to override the :root brand variables — empty string if all defaults. */
export function themeCss(settings: Record<string, string>): string {
  const overrides = Object.entries(settings)
    .filter(([k, v]) => THEME_DEFAULTS[k] && v !== THEME_DEFAULTS[k])
    .map(([k, v]) => `${CSS_VAR[k]}:${v};`)
    .join("");
  return overrides ? `:root{${overrides}}` : "";
}
