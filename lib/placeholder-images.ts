/** Deterministic hash → index, used for treatments that need a stable pick
 *  per id/slug with no database column behind them (city bento-tile colors,
 *  listing placeholder photos). Same input always yields the same output. */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

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

const PLACEHOLDER_PHOTO_COUNT = 4;

export function placeholderPhotoFor(id: string): string {
  if (!id) return "/placeholders/room-1.jpg";
  const index = (stableHash(id) % PLACEHOLDER_PHOTO_COUNT) + 1;
  return `/placeholders/room-${index}.jpg`;
}
