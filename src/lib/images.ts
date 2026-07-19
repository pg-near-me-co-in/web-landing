/** listing_images.storage_path holds either a full URL (legacy/demo rows) or
 *  a Supabase Storage object path — resolve both to a renderable URL. */
export function resolveImageUrl(storagePath: string): string {
  if (/^https?:\/\//.test(storagePath)) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/listing-images/${storagePath}`;
}
