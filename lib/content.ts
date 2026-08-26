/**
 * Single source of truth for site copy — nav labels, CTAs, hero/section text,
 * contact details. Nothing here is content-model data (that's
 * `data/*.json` + `lib/data/*`); this is marketing/UI copy that a
 * non-engineer should be able to find and edit in one place instead of
 * hunting across component files.
 */

export const SITE = {
  name: "PG Near Me",
  domain: "pgnearme.co.in",
  contactEmail: "hello@pgnearme.co.in",
  defaultTitle: "PG Near Me — Verified PGs on an interactive map, zero brokerage",
  defaultDescription:
    "Explore verified PGs, hostels and shared rooms on a live map — filter by city, budget, gender and sharing. Zero brokerage, direct owner contact.",
};

/**
 * TODO: replace with the real Google Form link once it exists — every
 * "List your PG" CTA points here instead of an in-app form/page.
 */
export const OWNER_FORM_URL = "https://forms.gle/REPLACE_WITH_REAL_FORM_ID";

export const HERO = {
  title: "Every verified PG in your city, on ",
  titleHighlight: "one map",
  subtitle:
    "Search PGs, hostels and shared rooms by city, area, budget, gender or sharing — pins update live as you filter. Zero brokerage, direct owner contact, no WhatsApp forwards.",
  ctaPrimary: "Browse verified PGs",
  ctaSecondary: "List your PG",
};

export const WHY_US = [
  {
    title: "Filters that mean something",
    body: "Gender policy, food, sharing, house rules, road access — structured fields, not vague free-text.",
  },
  {
    title: "Trust you can see",
    body: "Every listing shows a trust score built from verification and data completeness. Stale ones decay, verified ones rise.",
  },
  {
    title: "Owner in two taps",
    body: "Reveal the number, call or WhatsApp the owner directly. No middlemen. No commission.",
  },
];

export const OWNER_CTA = {
  title: "Skip the broker. Fill your rooms directly.",
  body: "One short form. No dashboard, no monthly fee, no commission. Approved listings go live across search and city pages within 24 hours.",
};

export const OWNER_BENEFITS = [
  "No commission on any lead — you keep 100%.",
  "Free during Phase 1 (early-city launch).",
  "No dashboard to learn — one form, submit, done.",
  "We manually verify listings so seekers arrive qualified.",
  "Update price and vacancy with a quick email — we handle the edits.",
];

export const ABOUT_COPY = {
  title: "Built for the four channels that fail every seeker.",
  paragraphs: [
    "Finding a PG in an Indian city is fragmented across broker WhatsApp groups, Facebook pages, generic classifieds with PG as an afterthought, and managed-living brands that only list their own inventory.",
    "None of them enforce structured data at listing time — so filters like gender policy, food type and sharing type either don't exist or are shallow. Seekers waste 3–7 days visiting properties that don't match. Owners either pay brokers 50–100% of a month's rent, or rely on neighborhood word-of-mouth.",
  ],
  approach:
    "A vertical-specific directory that captures the fields seekers actually filter on — and rewards owners who submit complete, fresh listings. Live across multiple cities today, growing city by city as supply and data quality warrant it.",
  notList: [
    "Not a booking or payments platform. We surface the owner's number; you visit and decide.",
    "Not affiliated with any managed-living brand.",
    "Every listing is either submitted by its owner or sourced from public directories (like OpenStreetMap) and clearly marked — owners can email us anytime to claim, correct or remove theirs.",
  ],
};

export const CITIES_COPY = {
  title: "Pick your city. Pick your room.",
  subtitle:
    "Every city gets its own verified directory — no brokers, no bait photos, no ghost listings. Tap a city to see what's live and who's moving in.",
};
