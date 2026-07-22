import type { SeoOverride } from "./queries";

export interface ResolvedSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

/**
 * SEO fallback precedence (documented in docs/SEO_AEO_GEO_STRATEGY.md §2):
 * `page_seo_meta` admin override → computed entity default. Each field
 * falls through independently — a partial override with only `meta_title`
 * set still gets the computed description, not an all-or-nothing swap.
 * `og_title`/`og_description` default to the *resolved* title/description
 * (not directly to the computed values), so overriding just the meta title
 * also updates the OG title unless an explicit `og_title` override exists.
 * `||` (not `??`) so a stray empty-string override — e.g. an admin saving
 * the SEO editor form with a field cleared — falls through too, never
 * returning an empty string.
 */
export function resolveSeo(
  override: SeoOverride | null,
  computed: { title: string; description: string }
): ResolvedSeo {
  const title = override?.meta_title || computed.title;
  const description = override?.meta_description || computed.description;
  return {
    title,
    description,
    ogTitle: override?.og_title || title,
    ogDescription: override?.og_description || description,
  };
}
