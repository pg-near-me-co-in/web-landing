-- PG Near Me — initial schema
-- Translated from docs/DATABASE_SCHEMA.md.
-- Conventions: uuid PKs, created_at/updated_at timestamptz, RLS on from day one.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- cities
-- ---------------------------------------------------------------------------
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  state text not null,
  lat numeric,
  lng numeric,
  is_launched boolean not null default false,
  listing_count_cache int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger cities_updated_at before update on public.cities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- areas
-- ---------------------------------------------------------------------------
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  slug text not null,
  lat numeric,
  lng numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);
create trigger areas_updated_at before update on public.areas
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- owners
-- ---------------------------------------------------------------------------
create table public.owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  whatsapp_number text,
  status text not null default 'pending' check (status in ('pending','active','blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger owners_updated_at before update on public.owners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- pg_listings (core table)
-- ---------------------------------------------------------------------------
create table public.pg_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.owners(id) on delete set null,
  city_id uuid not null references public.cities(id),
  area_id uuid references public.areas(id),
  name text not null,
  slug text not null unique,
  description text,
  address_line text,
  lat numeric,
  lng numeric,
  pg_type text not null check (pg_type in ('male','female','unisex')),
  sharing_types text[] not null default '{}',
  price_min numeric,
  price_max numeric,
  price_currency text not null default 'INR',
  religion_preference text,
  food_preference text check (food_preference in ('veg','non_veg','both','not_provided')),
  road_access text check (road_access in ('with_road','without_road')),
  house_rules_strictness text check (house_rules_strictness in ('strict','moderate','liberal')),
  curfew_time time,
  contact_phone text,
  contact_whatsapp text,
  status text not null default 'pending_review'
    check (status in ('draft','pending_review','published','rejected','archived')),
  source text not null default 'owner_submission'
    check (source in ('owner_submission','scrape','admin_manual')),
  rating_avg numeric(2,1),
  rating_count int not null default 0,
  trust_score numeric,
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pg_listings_updated_at before update on public.pg_listings
  for each row execute function public.set_updated_at();

create index pg_listings_city_area_status_idx on public.pg_listings (city_id, area_id, status);
create index pg_listings_pg_type_idx on public.pg_listings (pg_type);
create index pg_listings_price_idx on public.pg_listings (price_min, price_max);
create index pg_listings_sharing_types_idx on public.pg_listings using gin (sharing_types);

-- listing_count_cache maintenance: recount published listings for the city
create or replace function public.refresh_city_listing_count()
returns trigger language plpgsql security definer as $$
declare
  affected uuid[];
begin
  affected := array(select distinct c from unnest(array[
    case when tg_op in ('INSERT','UPDATE') then new.city_id end,
    case when tg_op in ('DELETE','UPDATE') then old.city_id end
  ]) as c where c is not null);
  update public.cities c
     set listing_count_cache = (
       select count(*) from public.pg_listings l
        where l.city_id = c.id and l.status = 'published')
   where c.id = any(affected);
  return null;
end $$;
create trigger pg_listings_city_count
  after insert or update of status, city_id or delete on public.pg_listings
  for each row execute function public.refresh_city_listing_count();

-- ---------------------------------------------------------------------------
-- listing_images
-- ---------------------------------------------------------------------------
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pg_listings(id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (length(trim(alt_text)) > 0),
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index listing_images_listing_idx on public.listing_images (listing_id, sort_order);

-- ---------------------------------------------------------------------------
-- amenities + listing_amenities
-- ---------------------------------------------------------------------------
create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_key text,
  category text check (category in ('comfort','safety','food')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.listing_amenities (
  listing_id uuid not null references public.pg_listings(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (listing_id, amenity_id)
);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pg_listings(id) on delete cascade,
  reviewer_name text not null,
  reviewer_phone_hash text,
  rating int not null check (rating between 1 and 5),
  review_text text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  source text not null default 'user_submitted' check (source in ('user_submitted','imported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();
create index reviews_listing_status_idx on public.reviews (listing_id, status);

-- keep pg_listings.rating_avg / rating_count in sync with approved reviews
create or replace function public.refresh_listing_rating()
returns trigger language plpgsql security definer as $$
declare
  lid uuid;
begin
  lid := coalesce(new.listing_id, old.listing_id);
  update public.pg_listings l
     set rating_avg = sub.avg_rating,
         rating_count = sub.cnt
    from (select round(avg(rating)::numeric, 1) as avg_rating, count(*) as cnt
            from public.reviews where listing_id = lid and status = 'approved') sub
   where l.id = lid;
  return null;
end $$;
create trigger reviews_rating_sync
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_listing_rating();

-- ---------------------------------------------------------------------------
-- leads (the notebook's "IP" capture)
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pg_listings(id) on delete cascade,
  name text,
  phone text not null,
  email text,
  intent text not null default 'contact_reveal'
    check (intent in ('contact_reveal','enquiry_form','callback_request')),
  message text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);
create index leads_listing_created_idx on public.leads (listing_id, created_at);

-- ---------------------------------------------------------------------------
-- admin_users (Supabase Auth backs admin login only)
-- ---------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin','editor','moderator','analyst')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.admin_users a
                  where a.id = auth.uid() and a.is_active);
$$;

-- ---------------------------------------------------------------------------
-- page_seo_meta (Phase 3)
-- ---------------------------------------------------------------------------
create table public.page_seo_meta (
  id uuid primary key default gen_random_uuid(),
  route_pattern text not null,
  entity_type text not null check (entity_type in ('static_page','city','area','listing')),
  entity_id uuid,
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  custom_json_ld jsonb,
  ai_generated boolean not null default false,
  updated_by uuid references public.admin_users(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings (Phase 3)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_by uuid references public.admin_users(id),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- scrape pipeline (Phase 3) — legal_review_status is a hard gate
-- ---------------------------------------------------------------------------
create table public.scrape_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text,
  type text not null check (type in ('html_scrape','api','manual_csv_import')),
  is_active boolean not null default false,
  legal_review_status text not null default 'not_reviewed'
    check (legal_review_status in ('not_reviewed','approved','rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger scrape_sources_updated_at before update on public.scrape_sources
  for each row execute function public.set_updated_at();

create table public.scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  scrape_source_id uuid not null references public.scrape_sources(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  started_at timestamptz,
  finished_at timestamptz,
  records_ingested int not null default 0,
  error_log text,
  triggered_by text not null default 'manual' check (triggered_by in ('cron','manual')),
  created_at timestamptz not null default now()
);

create table public.ingested_raw_listings (
  id uuid primary key default gen_random_uuid(),
  scrape_job_id uuid not null references public.scrape_jobs(id) on delete cascade,
  raw_payload jsonb not null,
  normalized_payload jsonb,
  dedup_match_listing_id uuid references public.pg_listings(id),
  dedup_confidence numeric,
  review_status text not null default 'pending'
    check (review_status in ('pending','approved_new','approved_merged','rejected')),
  reviewed_by uuid references public.admin_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------------
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.admin_users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public/anon: read-only, published/approved/active rows only.
-- Writes: service role (bypasses RLS) or admin users; the two public-write
-- exceptions are owner submissions and lead capture, done via server actions
-- with the service key, so no anon insert policies are needed.
-- ---------------------------------------------------------------------------
alter table public.cities enable row level security;
alter table public.areas enable row level security;
alter table public.owners enable row level security;
alter table public.pg_listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.amenities enable row level security;
alter table public.listing_amenities enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.admin_users enable row level security;
alter table public.page_seo_meta enable row level security;
alter table public.site_settings enable row level security;
alter table public.scrape_sources enable row level security;
alter table public.scrape_jobs enable row level security;
alter table public.ingested_raw_listings enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "public read launched cities" on public.cities
  for select using (is_launched or public.is_admin());
create policy "public read active areas" on public.areas
  for select using (is_active or public.is_admin());
create policy "public read published listings" on public.pg_listings
  for select using (status = 'published' or public.is_admin());
create policy "public read images of published listings" on public.listing_images
  for select using (
    exists (select 1 from public.pg_listings l
             where l.id = listing_id and (l.status = 'published' or public.is_admin())));
create policy "public read active amenities" on public.amenities
  for select using (is_active or public.is_admin());
create policy "public read listing amenities" on public.listing_amenities
  for select using (
    exists (select 1 from public.pg_listings l
             where l.id = listing_id and (l.status = 'published' or public.is_admin())));
create policy "public read approved reviews" on public.reviews
  for select using (
    status = 'approved' and exists (
      select 1 from public.pg_listings l
       where l.id = listing_id and l.status = 'published')
    or public.is_admin());
create policy "public read site settings" on public.site_settings
  for select using (true);
create policy "public read seo meta" on public.page_seo_meta
  for select using (true);

-- admin-only surfaces (leads, owners, scrape pipeline, audit log)
create policy "admin read owners" on public.owners for select using (public.is_admin());
create policy "admin read leads" on public.leads for select using (public.is_admin());
create policy "admin read admin_users" on public.admin_users for select using (public.is_admin());
create policy "admin read scrape_sources" on public.scrape_sources for select using (public.is_admin());
create policy "admin read scrape_jobs" on public.scrape_jobs for select using (public.is_admin());
create policy "admin read ingested" on public.ingested_raw_listings for select using (public.is_admin());
create policy "admin read audit log" on public.admin_audit_log for select using (public.is_admin());

-- admin write policies (service role bypasses RLS entirely)
create policy "admin write cities" on public.cities for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write areas" on public.areas for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write owners" on public.owners for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write listings" on public.pg_listings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write images" on public.listing_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write amenities" on public.amenities for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write listing_amenities" on public.listing_amenities for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write seo meta" on public.page_seo_meta for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- full-text search vector (Phase 2 ready)
-- ---------------------------------------------------------------------------
alter table public.pg_listings add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored;
create index pg_listings_search_idx on public.pg_listings using gin (search_vector);
