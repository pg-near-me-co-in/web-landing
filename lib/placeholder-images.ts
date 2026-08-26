/** Deterministic hash → index, used so a listing with no real photos always
 *  gets the same placeholder on every render (no database column needed). */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

const PLACEHOLDER_PHOTO_COUNT = 4;

export function placeholderPhotoFor(id: string): string {
  if (!id) return "/placeholders/room-1.jpg";
  const index = (stableHash(id) % PLACEHOLDER_PHOTO_COUNT) + 1;
  return `/placeholders/room-${index}.jpg`;
}
