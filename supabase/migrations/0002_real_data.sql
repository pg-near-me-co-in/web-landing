-- 0002: prepare for real-world (scraped) data + public image storage
-- Real sources (OSM) often lack gender policy — pg_type becomes nullable,
-- UI treats null as "unspecified".
alter table public.pg_listings alter column pg_type drop not null;

-- Supabase Storage: public bucket for listing images.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- anon (publishable key) may upload images into this bucket only;
-- everyone may read it. 5MB limit + image mime enforced at bucket level.
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg','image/png','image/webp']
 where id = 'listing-images';

create policy "anon upload listing images" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'listing-images');

create policy "public read listing images" on storage.objects
  for select using (bucket_id = 'listing-images');
