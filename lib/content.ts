/**
 * Single source of truth for site copy — nav labels, CTAs, hero/section text,
 * FAQs, contact details. Nothing here is content-model data (that's
 * `data/*.json` + `lib/data/*`); this is marketing/UI copy that a
 * non-engineer should be able to find and edit in one place instead of
 * hunting across component files.
 */

export const SITE = {
  name: "PG Near Me",
  domain: "pgnearme.co.in",
  contactEmail: "hello@pgnearme.co.in",
  tagline: "Find verified PGs, hostels and shared rooms across India with zero brokerage.",
  defaultTitle: "PG Near Me — Find PGs, Hostels & Shared Flats in India",
  defaultDescription:
    "Free directory of PGs, hostels and shared flats across India. Filter by city, budget, sharing type and gender — contact owners directly, no brokers.",
};

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/#search", label: "Find a PG" },
  { href: "/cities", label: "Cities" },
  { href: "/about", label: "About" },
  { href: "/for-owners", label: "For owners" },
];

export const HERO = {
  eyebrowPrefix: "LIVE IN",
  title: "Your next room is closer than you think.",
  titleHighlight: "closer",
  subtitle: "PGs, hostels, and shared rooms — verified, zero brokerage, anywhere in India.",
  ctaPrimary: "Browse listings",
  ctaSecondary: "How it works",
};

export const HOW_IT_WORKS = [
  {
    idx: "01 / SEARCH",
    title: "Tell us where and what",
    text: "Pick a city, area, or landmark. Filter by budget, gender preference, and sharing type.",
  },
  {
    idx: "02 / COMPARE",
    title: "See verified options",
    text: "Every listing is checked for photos, amenities, and accurate pricing before it goes live.",
  },
  {
    idx: "03 / CONNECT",
    title: "Talk to the owner directly",
    text: "Reveal the owner's number and call or WhatsApp them straight from the listing. No broker fee, ever.",
  },
];

export const PROPERTY_TYPES = [
  {
    icon: "♀",
    title: "PG for women",
    text: "Verified, secure PGs with women-only floors and strict entry rules where available.",
    query: "?type=female",
  },
  {
    icon: "♂",
    title: "PG for men",
    text: "Single, double & triple sharing with food and housekeeping included.",
    query: "?type=male",
  },
  {
    icon: "⌂",
    title: "Co-living spaces",
    text: "Mixed co-living PGs and hostels for professionals and students.",
    query: "?type=unisex",
  },
  {
    icon: "⇄",
    title: "Shared rooms",
    text: "Split rent in double, triple or 4-bed sharing — fully furnished.",
    query: "?sharing=Double",
  },
];

export const WHY_US = [
  {
    n: "01",
    title: "Verified listings only",
    text: "Every property is checked for accurate photos, pricing and amenities — and re-checked for staleness.",
  },
  {
    n: "02",
    title: "Zero brokerage",
    text: "Talk to owners directly. No hidden commission, ever — free for seekers and owners.",
  },
  {
    n: "03",
    title: "Pan-India, always growing",
    text: "The same simple search, wherever you're headed next — with honest reviews from real residents.",
  },
];

export const HOME_FAQS = [
  {
    q: "Is PG Near Me really free?",
    a: "Yes. PG Near Me is a free directory — seekers browse and contact owners for free, and owners list for free. We charge no brokerage or commission to either side.",
  },
  {
    q: "How do I contact a PG owner?",
    a: "Open any listing and tap “Show contact number”. After sharing your name and phone number, the owner's verified phone and WhatsApp are revealed so you can talk to them directly.",
  },
  {
    q: "Are the listings verified?",
    a: "Listings are reviewed by our team before publishing, and we periodically re-verify prices and availability with owners. Each listing shows when it was last verified.",
  },
  {
    q: "How do I list my PG or hostel?",
    a: "Use the “List your property” button, fill in your property details, and our team will verify and publish it. It takes a few minutes and costs nothing.",
  },
];

export const OWNER_BENEFITS = [
  "No commission on any lead — you keep 100%.",
  "Free to list — zero listing fee, ever.",
  "No dashboard to learn — one form, submit, done.",
  "We manually verify listings so seekers arrive qualified.",
  "Update price and vacancy with a quick email — our team handles the edits.",
];

export const OWNER_FAQS = [
  {
    q: "How much does it cost to list my PG on PG Near Me?",
    a: "Nothing. Listing is free, with zero commission on any lead — PG Near Me is a directory, not a broker, so you keep 100% of what a seeker pays you.",
  },
  {
    q: "How long does listing verification take?",
    a: 'Our team reviews and verifies each submission before it goes live — typically within a few days. You can submit via the "Add your PG" form.',
  },
  {
    q: "Can I update my price or vacancy later?",
    a: `Yes — email ${"hello@pgnearme.co.in"} with the changes and our team updates the listing for you. There's no owner dashboard to log into.`,
  },
];

export const ABOUT_COPY = {
  title: "Built for the four channels that fail every seeker.",
  paragraphs: [
    "Finding a PG in an Indian city is fragmented across broker WhatsApp groups, Facebook pages, generic classifieds with PG as an afterthought, and managed-living brands that only list their own inventory.",
    "None of them enforce structured data at listing time — so filters like gender policy, food type and sharing type either don't exist or are shallow. Seekers waste days visiting properties that don't match. Owners either pay brokers 50–100% of a month's rent, or rely on neighborhood word-of-mouth.",
  ],
  approach:
    "A vertical-specific directory that captures the fields seekers actually filter on — and rewards owners who submit complete, fresh listings. City by city, expanding only when supply and quality warrant it.",
  notList: [
    "Not a booking or payments platform. We surface the owner's number; you visit and decide.",
    "Not affiliated with any managed-living brand.",
    "Not a scraper of anyone else's listings. Every listing is submitted by an owner or ingested from an openly licensed public source (OpenStreetMap), then verified by our team.",
  ],
};
