export interface SeoOverride {
  meta_title?: string | null;
  meta_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

/**
 * SEO fallback precedence (docs/SEO_AEO_GEO_STRATEGY.md §2): admin override
 * (Phase B, once `page_seo_meta` exists) → computed entity default. Each
 * field falls through independently. `og_title`/`og_description` default to
 * the *resolved* title/description, not directly to the computed values.
 * `||` (not `??`) so a stray empty-string override never wins.
 * `override` is always `null` in Phase A — no admin editor exists yet — but
 * the shape is kept so wiring in the real override source later is a
 * one-line change, not a redesign.
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
