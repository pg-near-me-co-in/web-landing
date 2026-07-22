-- Additive-only: adds per-city marketing content for the new Cities
-- directory / About / homepage bento cards (2026-07 UI overhaul). No
-- existing column/enum is renamed or restructured, no RLS policy change —
-- these are plain nullable text columns, same "row-filter only" policy
-- (public read launched cities) already covers the new columns.

alter table public.cities add column if not exists tagline text;
alter table public.cities add column if not exists hero_image_url text;

comment on column public.cities.tagline is
  'Short marketing line shown on city cards, e.g. "Student hub around MSU, Alkapuri & Sayajigunj". Admin-editable via /admin/cities.';
comment on column public.cities.hero_image_url is
  'Optional hero photo URL for the city card/detail (external URL or Supabase Storage path, same convention as listing_images.storage_path). Null falls back to a deterministic gradient tile (see src/lib/placeholder-images.ts).';
