// Ingest real PG/hostel data from OpenStreetMap (Overpass API) through the
// documented pipeline: scrape_sources -> scrape_jobs -> ingested_raw_listings
// -> pg_listings (source='scrape').
// License: ODbL — data © OpenStreetMap contributors, attribution required.
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.ggaxffyliyblgqqpapcn',
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];
const RADIUS_M = 22000;
const MAX_PER_CITY = 120;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
}

function inferPgType(name, tags) {
  if (tags.female === 'yes' && tags.male === 'yes') return 'unisex';
  if (tags.female === 'yes') return 'female';
  if (tags.male === 'yes') return 'male';
  if (/(girls?|ladies|women|mahila)/i.test(name)) return 'female';
  if (/(boys?|gents?|\bmen'?s?\b)/i.test(name)) return 'male';
  return null;
}

function distKm(aLat, aLng, bLat, bLng) {
  const d2r = Math.PI / 180;
  const dLat = (bLat - aLat) * d2r;
  const dLng = (bLng - aLng) * d2r;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * d2r) * Math.cos(bLat * d2r) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function buildAddress(tags) {
  const parts = [
    tags['addr:housenumber'] && tags['addr:street']
      ? `${tags['addr:housenumber']}, ${tags['addr:street']}`
      : tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
  ].filter(Boolean);
  return tags['addr:full'] || (parts.length ? parts.join(', ') : null);
}

// Resolve an OSM `wikimedia_commons` tag (format "File:Something.jpg") to a
// stable upload.wikimedia.org asset URL, resolved server-side at scrape time
// so we store the final CDN URL rather than a redirect. Deliberately does
// NOT touch the free-text `image=` tag (arbitrary third-party hosts) or
// `Category:` refs (would need a second API call to list members) — only
// single-file Commons references, which are CC-licensed and consistent with
// the existing OSM/ODbL attribution pattern already in this site's footer.
const WIKIMEDIA_FILEPATH_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

async function resolveWikimediaImageUrl(commonsTag) {
  if (!commonsTag || !commonsTag.startsWith('File:')) return null;
  const filename = commonsTag.slice('File:'.length);
  try {
    const res = await fetch(WIKIMEDIA_FILEPATH_BASE + encodeURIComponent(filename), {
      method: 'HEAD',
      redirect: 'follow',
    });
    if (!res.ok || !res.url) return null;
    // Only trust a resolved URL that actually landed on Wikimedia's own CDN.
    return res.url.startsWith('https://upload.wikimedia.org/') ? res.url : null;
  } catch {
    return null;
  }
}

async function fetchCity(city) {
  const q = `[out:json][timeout:240][maxsize:536870912];
(
  nwr["tourism"="hostel"](around:${RADIUS_M},${city.lat},${city.lng});
  nwr["name"~"[Pp]aying [Gg]uest"](around:${RADIUS_M},${city.lat},${city.lng});
  nwr["name"~"PG"](around:${RADIUS_M},${city.lat},${city.lng});
);
out center tags ${MAX_PER_CITY * 6};`;
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'pgnearme.co.in data seeder (hello@pgnearme.co.in)',
            Accept: 'application/json',
          },
          body: 'data=' + encodeURIComponent(q),
        });
        if (!res.ok) throw new Error(`Overpass ${res.status} at ${url} for ${city.name}`);
        const data = await res.json();
        return data.elements ?? [];
      } catch (e) {
        lastErr = e;
        await sleep(10000);
      }
    }
  }
  throw lastErr;
}

async function normalize(elements, city, areas) {
  const seen = new Set();
  const out = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = (tags.name ?? '').trim();
    if (!name || name.length < 4) continue;
    // must be a hostel OR have a PG-ish name (word-boundary "PG" / "paying guest")
    const isPgName = /\bPG\b/.test(name) || /paying guest/i.test(name);
    if (tags.tourism !== 'hostel' && !isPgName) continue;
    // skip university dorm blocks / generic "Block A" style names
    if (/\bblock\b/i.test(name)) continue;
    // skip non-accommodation OSM elements whose *name* merely contains "PG"
    // (power lines, railways, roads, …)
    const INFRA_TAGS = ['power', 'railway', 'highway', 'waterway', 'pipeline',
      'man_made', 'landuse', 'natural', 'boundary'];
    if (INFRA_TAGS.some((t) => t in tags)) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);

    // nearest seeded area within 4km, else no area
    let area = null;
    let best = 4;
    for (const a of areas) {
      const d = distKm(lat, lng, Number(a.lat), Number(a.lng));
      if (d < best) {
        best = d;
        area = a;
      }
    }

    const phone = tags.phone || tags['contact:phone'] || null;
    const imageUrl = await resolveWikimediaImageUrl(tags.wikimedia_commons);
    out.push({
      osm: `${el.type}/${el.id}`,
      name,
      lat,
      lng,
      phone,
      website: tags.website || tags['contact:website'] || null,
      address: buildAddress(tags),
      pg_type: inferPgType(name, tags),
      area,
      imageUrl,
      raw: { type: el.type, id: el.id, tags },
      score:
        (phone ? 2 : 0) +
        (buildAddress(tags) ? 1 : 0) +
        (tags.tourism === 'hostel' ? 1 : 0) +
        (imageUrl ? 1 : 0),
    });
  }
  // richest records first, cap per city
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, MAX_PER_CITY);
}

async function main() {
  await client.connect();

  // 1. source (legal gate: ODbL approved with attribution)
  const src = await client.query(
    `insert into scrape_sources (name, base_url, type, is_active, legal_review_status, notes)
     values ('OpenStreetMap (Overpass API)', 'https://overpass-api.de', 'api', true, 'approved',
             'ODbL license — requires "© OpenStreetMap contributors" attribution on the site. Share-alike applies to the derived listing database.')
     on conflict do nothing
     returning id`
  );
  const sourceId =
    src.rows[0]?.id ??
    (await client.query(`select id from scrape_sources where name like 'OpenStreetMap%' limit 1`)).rows[0].id;

  // 2. job
  const job = await client.query(
    `insert into scrape_jobs (scrape_source_id, status, started_at, triggered_by)
     values ($1, 'running', now(), 'manual') returning id`,
    [sourceId]
  );
  const jobId = job.rows[0].id;

  const cities = (
    await client.query(`select id, name, slug, lat, lng from cities where is_launched`)
  ).rows;
  const areasByCity = {};
  for (const c of cities) {
    areasByCity[c.slug] = (
      await client.query(`select id, name, slug, lat, lng from areas where city_id = $1`, [c.id])
    ).rows;
  }

  let ingested = 0;
  let published = 0;
  const failures = [];
  try {
    for (const city of cities) {
      // resume support: skip cities that already have scraped listings
      const existing = await client.query(
        `select count(*)::int as n from pg_listings where city_id=$1 and source='scrape'`,
        [city.id]
      );
      if (existing.rows[0].n > 0) {
        console.log(`${city.name}: already has ${existing.rows[0].n} scraped listings — skipping`);
        continue;
      }
      process.stdout.write(`${city.name}: fetching… `);
      let elements;
      try {
        elements = await fetchCity(city);
      } catch (e) {
        console.log(`FAILED (${e.message}) — continuing`);
        failures.push(`${city.name}: ${e.message}`);
        continue;
      }
      const records = await normalize(elements, city, areasByCity[city.slug]);
      console.log(`${elements.length} raw -> ${records.length} normalized`);

      for (const r of records) {
        const slug = `${slugify(r.name)}-${city.slug}`;
        const normalized = {
          name: r.name, slug, city_slug: city.slug, area_slug: r.area?.slug ?? null,
          lat: r.lat, lng: r.lng, phone: r.phone, website: r.website,
          address_line: r.address, pg_type: r.pg_type,
        };
        await client.query(
          `insert into ingested_raw_listings
             (scrape_job_id, raw_payload, normalized_payload, review_status, reviewed_at)
           values ($1, $2, $3, 'approved_new', now())`,
          [jobId, JSON.stringify(r.raw), JSON.stringify(normalized)]
        );
        ingested++;

        const kind = /hostel/i.test(r.name) ? 'hostel' : 'PG';
        const locality = r.area?.name ?? city.name;
        const desc =
          `${r.name} is a ${r.pg_type ? { male: "men's", female: "women's", unisex: 'co-living' }[r.pg_type] + ' ' : ''}` +
          `${kind} in ${locality}, ${city.name}. ` +
          `Location sourced from OpenStreetMap (© OpenStreetMap contributors); ` +
          `pricing and amenities are pending verification with the owner.`;

        const ins = await client.query(
          `insert into pg_listings
             (city_id, area_id, name, slug, description, address_line, lat, lng,
              pg_type, sharing_types, contact_phone, status, source, published_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'{}',$10,'published','scrape', now())
           on conflict (slug) do nothing
           returning id`,
          [city.id, r.area?.id ?? null, r.name, slug, desc, r.address, r.lat, r.lng, r.pg_type, r.phone]
        );
        if (ins.rows[0]) {
          published++;
          if (r.imageUrl) {
            await client.query(
              `insert into listing_images (listing_id, storage_path, alt_text, sort_order, is_cover)
               values ($1, $2, $3, 0, true)`,
              [ins.rows[0].id, r.imageUrl, `${r.name} — exterior photo (OpenStreetMap/Wikimedia Commons)`]
            );
          }
        }
      }
      await sleep(3000); // be polite to Overpass
    }

    await client.query(
      `update scrape_jobs set status='completed', finished_at=now(), records_ingested=$2, error_log=$3 where id=$1`,
      [jobId, ingested, failures.length ? failures.join('\n') : null]
    );
  } catch (e) {
    await client.query(
      `update scrape_jobs set status='failed', finished_at=now(), records_ingested=$2, error_log=$3 where id=$1`,
      [jobId, ingested, String(e.message)]
    );
    throw e;
  }

  const counts = await client.query(
    `select c.name, c.listing_count_cache from cities c where c.is_launched order by c.name`
  );
  console.log(`\ningested=${ingested} published=${published}`);
  console.table(counts.rows);
  await client.end();
}

main().catch(async (e) => {
  console.error('ERROR:', e);
  try { await client.end(); } catch {}
  process.exit(1);
});
