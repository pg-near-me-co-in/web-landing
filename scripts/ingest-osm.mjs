#!/usr/bin/env node
/**
 * Transforms data/raw-data/pg_rental.osm_raw.json (raw OpenStreetMap dump)
 * into data/listings.json + data/cities.json, matching lib/types.ts's
 * Listing/City shape. Re-run whenever a fresh raw-data drop lands:
 *
 *   npm run ingest:osm
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW_PATH = path.join(ROOT, "data/raw-data/pg_rental.osm_raw.json");
const LISTINGS_PATH = path.join(ROOT, "data/listings.json");
const CITIES_PATH = path.join(ROOT, "data/cities.json");

const LODGING_TYPES = new Set([
  "guest_house",
  "hostel",
  "apartment",
  "apartments",
]);

// City metadata not present in OSM — curated once, reused every ingest run.
// Only the 10 cities actually present in data/raw-data/pg_rental.osm_raw.json —
// no leftover demo cities from before the OSM ingestion existed.
// `image` points at an original hand-authored vector card (public/city-icons/),
// not stock photography or any third-party asset.
const CITY_META = {
  vadodara: { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, image: "/city-icons/vadodara.svg", tagline: "Student hub around MSU, Alkapuri & Sayajigunj" },
  mumbai: { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, image: "/city-icons/mumbai.svg", tagline: "Andheri, Powai & Navi Mumbai shared living" },
  bengaluru: { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, image: "/city-icons/bengaluru.svg", tagline: "Tech corridors from Koramangala to Whitefield" },
  gurugram: { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, image: "/city-icons/gurugram.svg", tagline: "Cyber City, Sohna Road & Golf Course Road stays" },
  noida: { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391, image: "/city-icons/noida.svg", tagline: "Sector 62, Greater Noida & Noida Extension PGs" },
  pune: { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, image: "/city-icons/pune.svg", tagline: "Kothrud, Baner & Hinjewadi picks for movers" },
  hyderabad: { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, image: "/city-icons/hyderabad.svg", tagline: "Gachibowli, Madhapur & HITEC City rooms" },
  ahmedabad: { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, image: "/city-icons/ahmedabad.svg", tagline: "SG Highway, Navrangpura & Bopal PGs" },
  gandhinagar: { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369, image: "/city-icons/gandhinagar.svg", tagline: "Sector-planned city living near GIFT City" },
  kota: { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648, image: "/city-icons/kota.svg", tagline: "Coaching-hub hostels for exam aspirants" },
};

function slugifyCity(city) {
  return city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizePhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/[^0-9+]/g, "");
  const bare = digits.replace(/\+/g, "");
  if (bare.length === 10) return `+91 ${bare}`;
  if (bare.length === 11 && bare.startsWith("0")) return `+91 ${bare.slice(1)}`;
  if (bare.length === 12 && bare.startsWith("91")) return `+${bare}`;
  if (digits.startsWith("+")) return digits;
  return bare.length >= 8 ? `+91 ${bare}` : "";
}

function firstTag(tags, keys) {
  for (const k of keys) {
    const v = tags[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function isLodging(tags) {
  const t = (tags.tourism || "").toLowerCase();
  if (LODGING_TYPES.has(t)) return true;
  // handles messy variants: "Hostel", "hostel;boys'_hostel", "Girls' hostel"
  return /hostel|guest_house|guest house/.test(t);
}

// Crowdsourced OSM tagging is noisy — e.g. a university mapped as
// tourism=guest_house. A name containing one of these institutional words
// (and not also "pg"/"hostel") is almost never an actual PG listing.
const NON_PG_NAME = /(university|college|institute|hospital|temple|mandir|church|masjid|mosque|gurudwara|school)/i;
function looksLikeNonPg(name) {
  return NON_PG_NAME.test(name) && !/\b(pg|hostel)\b/i.test(name);
}

const GENDER_WORDS = {
  female: /\b(ladies|women|girls?)\b/i,
  male: /\b(gents?|men|boys?)\b/i,
};

function inferGender(tags, name) {
  const female = tags.female === "yes";
  const male = tags.male === "yes";
  const unisex = tags.unisex === "yes";
  if (unisex || (female && male)) return "unisex";
  if (female) return "female";
  if (male) return "male";
  // OSM has almost no gender tags — Indian PG names usually say it outright.
  if (GENDER_WORDS.female.test(name)) return "female";
  if (GENDER_WORDS.male.test(name)) return "male";
  return null;
}

function buildAddress(tags, city, name) {
  const nameLower = name.toLowerCase();
  // Crowdsourced entries sometimes repeat the listing name (or free text
  // like "Near X Mandir") in addr:housenumber/addr:street — drop a part
  // if it just duplicates the name or reads as a full sentence, not an address.
  const housenumber = tags["addr:housenumber"] && tags["addr:housenumber"].length <= 12 ? tags["addr:housenumber"] : "";
  const street = tags["addr:street"] && !tags["addr:street"].toLowerCase().includes(nameLower) ? tags["addr:street"] : "";
  const parts = [
    [housenumber, street].filter(Boolean).join(" "),
    tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:quarter"] || tags["addr:hamlet"],
    city,
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

function buildAmenities(tags) {
  const amenities = [];
  if (tags.internet_access && tags.internet_access !== "no") amenities.push("WiFi");
  if (tags.air_conditioning === "yes") amenities.push("AC");
  if (tags.parking) amenities.push("Parking");
  if (tags.wheelchair === "yes") amenities.push("Wheelchair access");
  return amenities;
}

function computeTrustScore({ hasPhone, hasStreetAddress, hasGender, hasAmenities }) {
  let score = 2.0;
  if (hasPhone) score += 1.0;
  if (hasStreetAddress) score += 0.5;
  if (hasGender) score += 0.3;
  if (hasAmenities) score += 0.2;
  return Math.max(1.0, Math.min(5.0, Math.round(score * 10) / 10));
}

function buildDescription(name, gender, locality, city) {
  const genderPhrase = gender === "female" ? "women-only" : gender === "male" ? "men-only" : "co-living";
  const where = locality === city ? city : `${locality}, ${city}`;
  return `${name} is a ${genderPhrase} PG/hostel in ${where}. Contact the owner directly for current rent, sharing options and availability.`;
}

function main() {
  const raw = JSON.parse(readFileSync(RAW_PATH, "utf-8"));
  const bySlug = new Map();
  const listings = [];
  const cityCounts = new Map();

  for (const row of raw) {
    const tags = row.tags || {};
    const name = firstTag(tags, ["name", "alt_name", "official_name", "short_name"]);
    if (!name || !isLodging(tags) || looksLikeNonPg(name)) continue;

    const cityRaw = row.city || tags["addr:city"] || "";
    if (!cityRaw) continue;
    const citySlug = slugifyCity(cityRaw);
    if (!CITY_META[citySlug]) continue; // stay within the 10 known launch cities

    const locality =
      tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:quarter"] || tags["addr:hamlet"] || CITY_META[citySlug].name;
    const address = buildAddress(tags, CITY_META[citySlug].name, name) || `${name}, ${CITY_META[citySlug].name}`;
    const phone = normalizePhone(firstTag(tags, ["phone", "contact:phone", "contact:mobile", "mobile"]));
    const gender = inferGender(tags, name);
    const amenities = buildAmenities(tags);

    let baseSlug = slugify(`${name}-${locality}`);
    let slug = baseSlug;
    let n = 2;
    while (bySlug.has(`${citySlug}/${slug}`)) {
      slug = `${baseSlug}-${n++}`;
    }
    bySlug.set(`${citySlug}/${slug}`, true);

    const hasStreetAddress = Boolean(tags["addr:street"] || tags["addr:housenumber"]);

    listings.push({
      id: `l-${citySlug}-${listings.length + 1}`,
      name,
      slug,
      city_slug: citySlug,
      locality,
      address,
      lat: typeof row.lat === "number" ? row.lat : null,
      lng: typeof row.lon === "number" ? row.lon : null,
      description: buildDescription(name, gender, locality, CITY_META[citySlug].name),
      pg_gender: gender,
      sharing_types: [],
      price_min: null,
      price_max: null,
      food_type: null,
      house_rules: null,
      road_access: true,
      contact_phone: phone,
      contact_whatsapp: phone || null,
      amenities,
      images: [],
      trust_score: computeTrustScore({
        hasPhone: Boolean(phone),
        hasStreetAddress,
        hasGender: Boolean(gender),
        hasAmenities: amenities.length > 0,
      }),
      verified_at: null,
      updated_at: (row.swept_at && row.swept_at.$date ? row.swept_at.$date : new Date().toISOString()).slice(0, 10),
    });

    cityCounts.set(citySlug, (cityCounts.get(citySlug) || 0) + 1);
  }

  const cities = Object.entries(CITY_META).map(([slug, meta]) => {
    const count = cityCounts.get(slug) || 0;
    return {
      id: `c-${slug}`,
      slug,
      name: meta.name,
      state: meta.state,
      lat: meta.lat,
      lng: meta.lng,
      image: meta.image,
      tagline: meta.tagline,
      count: count > 0 ? `${count} listing${count === 1 ? "" : "s"}` : "Rolling out",
      is_launched: count > 0,
    };
  });

  writeFileSync(LISTINGS_PATH, JSON.stringify(listings, null, 2) + "\n");
  writeFileSync(CITIES_PATH, JSON.stringify(cities, null, 2) + "\n");

  console.log(`Ingested ${listings.length} listings across ${cities.filter((c) => c.is_launched).length} launched cities.`);
  for (const c of cities) {
    console.log(`  ${c.name}: ${c.count}`);
  }
}

main();
