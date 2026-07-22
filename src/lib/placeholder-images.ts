/** Deterministic hash → index, used for treatments that need a stable pick
 *  per id/slug without a database column (city bento-tile colors, listing
 *  placeholder photos). Same input always yields the same output. */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** ref .city-card background rotation (c1..c8) — used on the homepage and
 *  the /cities directory when a city has no `hero_image_url`. */
export const CITY_CARD_BG = [
  "bg-primary-tint",
  "bg-success-bg",
  "bg-warn-bg",
  "bg-[#EFE9FB]",
  "bg-grey-50",
  "bg-[#E6F6EF]",
  "bg-[#FDF1DC]",
  "bg-[#F1EFFB]",
] as const;

export function cityHeroTreatment(citySlug: string): number {
  if (!citySlug) return 0;
  return stableHash(citySlug) % CITY_CARD_BG.length;
}

/** Self-hosted local stock photos (public/placeholders/room-{1..4}.jpg) used
 *  when a listing has no real photos — same idea as
 *  ref/make-joyful-moments-main's lib/images.ts deterministic picker, but
 *  self-hosted instead of hotlinked to Unsplash. */
const PLACEHOLDER_PHOTO_COUNT = 4;

export function placeholderPhotoFor(listingId: string): string {
  if (!listingId) return "/placeholders/room-1.jpg";
  const index = (stableHash(listingId) % PLACEHOLDER_PHOTO_COUNT) + 1;
  return `/placeholders/room-${index}.jpg`;
}
