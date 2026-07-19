-- 0003: trust/data-rating score v1 (the notebook's ⭐ item) + AI review summary
-- Trust score 0–100, computed from the row's own columns (no joins, so it is
-- safe to run as a BEFORE trigger):
--   • up to 40 pts — review rating, weight ramps up over the first 5 reviews
--   • up to 30 pts — data completeness (description, price, phone, type, sharing, area)
--   • up to 30 pts — verification recency (full ≤ 180 days, then linear decay to 0 at 2 years)

alter table public.pg_listings add column if not exists ai_review_summary text;

create or replace function public.compute_trust_score(l public.pg_listings)
returns numeric language sql immutable as $$
  select round(
    coalesce(l.rating_avg / 5.0 * 40 * least(l.rating_count, 5) / 5.0, 0)
    + (case when l.description is not null and length(l.description) >= 40 then 6 else 0 end)
    + (case when l.price_min is not null then 6 else 0 end)
    + (case when l.contact_phone is not null then 6 else 0 end)
    + (case when l.pg_type is not null then 4 else 0 end)
    + (case when coalesce(array_length(l.sharing_types, 1), 0) > 0 then 4 else 0 end)
    + (case when l.area_id is not null then 4 else 0 end)
    + (case
         when l.verified_at is null then 0
         when l.verified_at > now() - interval '180 days' then 30
         when l.verified_at > now() - interval '730 days' then
           round(30 * (1 - extract(epoch from (now() - l.verified_at - interval '180 days'))
                         / extract(epoch from interval '550 days')))
         else 0
       end)
  , 0)
$$;

create or replace function public.set_trust_score()
returns trigger language plpgsql as $$
begin
  new.trust_score := public.compute_trust_score(new);
  return new;
end $$;

drop trigger if exists pg_listings_trust_score on public.pg_listings;
create trigger pg_listings_trust_score
  before insert or update on public.pg_listings
  for each row execute function public.set_trust_score();

-- backfill existing rows (no-op update fires the trigger)
update public.pg_listings set updated_at = updated_at;
