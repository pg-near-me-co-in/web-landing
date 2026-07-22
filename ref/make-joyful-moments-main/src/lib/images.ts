import room1 from "@/assets/pg-room-1.jpg";
import roomSingle from "@/assets/pg-room-single.jpg";
import common from "@/assets/pg-common-1.jpg";
import food from "@/assets/pg-food.jpg";

/**
 * Deterministic cover-image picker for seed listings (no uploaded images yet).
 * Real listings should use their `cover_image` field.
 */
const gallery = [room1, roomSingle, common, food];

export function coverFor(slug: string, cover?: string | null): string {
  if (cover && cover.length > 0) return cover;
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return gallery[Math.abs(h) % gallery.length];
}

export function galleryFor(slug: string, images: unknown): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.filter((x): x is string => typeof x === "string");
  }
  // Fallback deterministic gallery so detail page never looks empty pre-Phase 2.
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  const start = Math.abs(h) % gallery.length;
  return [gallery[start], gallery[(start + 1) % gallery.length], gallery[(start + 2) % gallery.length]];
}
