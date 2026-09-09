"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, LocateFixed, X, Maximize2, Minimize2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPriceRange, genderLabel, placeName, GENDER_COLOR, GENDER_COLOR_FALLBACK, SHARING_TYPES } from "@/lib/format";
import { getCityBySlug } from "@/lib/data/cities";
import { avatarSvgMarkup } from "@/lib/generated-avatar";

/**
 * Interactive PG discovery map (client-only — lazy loaded from the
 * homepage). Pins are live-filtered by the overlay search bar; popups
 * deep-link to listing pages. SEO-critical content (the crawlable listing
 * links list) stays server-rendered alongside this on the homepage.
 */

const INDIA_CENTER: [number, number] = [21.5, 76.5];
// Keeps the map focused on India instead of drifting out to show
// neighbouring countries/ocean when zoomed out or panned.
const INDIA_BOUNDS = L.latLngBounds([6.5, 68], [37.5, 97.5]);

const MAP_CSS = `
.pgm-pin-wrap { background: transparent; border: none; position: relative; }
.pgm-pin-ring {
  width: 48px; height: 48px; border-radius: 50%; padding: 3px;
  box-shadow: 0 8px 18px -8px rgb(15 18 25 / 0.45);
  transition: transform .15s ease; cursor: pointer;
}
.pgm-pin-wrap:hover .pgm-pin-ring { transform: scale(1.08); }
.pgm-pin-photo {
  width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff;
  background-size: cover; background-position: center; background-color: var(--color-grey-10);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.pgm-pin-photo svg { width: 100%; height: 100%; }
.pgm-pin-price {
  position: absolute; bottom: -4px; right: -8px; padding: 2px 7px; border-radius: 999px;
  background: var(--color-primary); color: #fff; font: 700 10px/1.6 var(--font-sans);
  border: 2px solid #fff; white-space: nowrap; pointer-events: none;
}
.pgm-map .leaflet-popup-content-wrapper {
  border-radius: 16px; border: 1px solid var(--color-border);
}
.pgm-map .leaflet-popup-content { margin: 14px 16px; font-family: var(--font-sans); line-height: 1.45; }
.pgm-pop { display: flex; gap: 10px; min-width: 200px; }
.pgm-pop-thumb {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 2px 6px -2px rgb(15 18 25 / 0.4);
  background-size: cover; background-position: center; background-color: var(--color-grey-10);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.pgm-pop-thumb svg { width: 100%; height: 100%; }
.pgm-pop-name { font-family: var(--font-display); font-weight: 700; font-size: 14px; color: var(--color-grey-900); }
.pgm-pop-loc { margin-top: 2px; font-size: 12px; color: var(--color-grey-500); }
.pgm-pop-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.pgm-pop-tags span {
  border-radius: 8px; border: 1px solid var(--color-border);
  background: var(--color-grey-10); padding: 3px 8px;
  font-size: 10px; font-weight: 700; color: var(--color-grey-900);
}
.pgm-pop-link {
  display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 700;
  color: var(--color-primary); text-decoration: none;
}
.pgm-pop-link:hover { text-decoration: underline; }
.pgm-map .leaflet-control-attribution { font-size: 10px; }
`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const BUDGET_OPTIONS = [
  { id: "any", label: "Any budget" },
  { id: "6000", label: "Under ₹6k" },
  { id: "10000", label: "Under ₹10k" },
  { id: "15000", label: "Under ₹15k" },
  { id: "25000", label: "Under ₹25k" },
];

const GENDER_OPTIONS = [
  { id: "any", label: "Any gender" },
  { id: "male", label: "Male only" },
  { id: "female", label: "Female only" },
  { id: "unisex", label: "Unisex / Co-living" },
];

/** Real photo when the listing has one; otherwise the same generated-avatar
 *  SVG used everywhere else a listing has no photo (lib/generated-avatar.ts) —
 *  never a generic stock image. */
function thumbFill(l: Listing): string {
  const photo = l.images[0]?.storage_path;
  return photo ? `background-image:url('${photo.replace(/'/g, "%27")}')` : "";
}
function thumbInner(l: Listing, size: number): string {
  return l.images[0]?.storage_path ? "" : avatarSvgMarkup(l.id, l.name, size);
}

function pinIcon(l: Listing) {
  const priceLabel = l.price_min != null ? `₹${(l.price_min / 1000).toFixed(1).replace(/\.0$/, "")}k` : "PG";
  const ringColor = l.pg_gender ? GENDER_COLOR[l.pg_gender] : GENDER_COLOR_FALLBACK;
  return L.divIcon({
    className: "pgm-pin-wrap",
    html: `
      <div class="pgm-pin-ring" style="background:${ringColor}">
        <div class="pgm-pin-photo" style="${thumbFill(l)}">${thumbInner(l, 44)}</div>
      </div>
      <div class="pgm-pin-price">${esc(priceLabel)}</div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -30],
  });
}

function popupHtml(l: Listing) {
  const city = getCityBySlug(l.city_slug)?.name ?? "India";
  return `
    <div class="pgm-pop">
      <div class="pgm-pop-thumb" style="${thumbFill(l)}">${thumbInner(l, 44)}</div>
      <div>
        <div class="pgm-pop-name">${esc(l.name)}</div>
        <div class="pgm-pop-loc">${esc(placeName(l.locality, city))} · ${esc(genderLabel(l.pg_gender))}</div>
        <div class="pgm-pop-tags">
          <span>${esc(l.sharing_types[0] ?? "Shared")}</span>
          <span>${esc(formatPriceRange(l.price_min, l.price_max))}</span>
          <span>★ ${l.trust_score.toFixed(1)}</span>
        </div>
        <a class="pgm-pop-link" href="/pg/${encodeURIComponent(l.city_slug)}/${encodeURIComponent(l.slug)}" aria-label="View details for ${esc(l.name)}">View details →</a>
      </div>
    </div>`;
}

interface NearMe {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/** Reads a near-me result cached earlier this tab session, validated against today's listings. */
function readCachedNearMe(listings: Listing[]): NearMe | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem("pgm_near_me");
    if (!cached) return null;
    const nearest = JSON.parse(cached) as NearMe;
    return listings.some((l) => l.city_slug === nearest.id) ? nearest : null;
  } catch {
    return null;
  }
}

export default function HomeMap({ listings }: { listings: Listing[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [q, setQ] = useState("");
  const [city, setCity] = useState(() => readCachedNearMe(listings)?.id ?? "any");
  const [gender, setGender] = useState("any");
  const [budget, setBudget] = useState("any");
  const [sharing, setSharing] = useState("any");
  const [nearMeCity, setNearMeCity] = useState<string | null>(() => readCachedNearMe(listings)?.label ?? null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(() => {
    const cached = readCachedNearMe(listings);
    return cached ? { lat: cached.lat, lng: cached.lng } : null;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(l.city_slug, getCityBySlug(l.city_slug)?.name ?? l.city_slug);
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [listings]);

  // Auto-requests location once per tab session on load (skipped entirely if
  // a cached result already seeded state above). Browsers require a secure
  // context (https or localhost) for this, and this silently no-ops on
  // denial/error/timeout — never blocks or nags the page.
  useEffect(() => {
    if (cities.length === 0 || nearMeCity) return;
    if (!navigator.geolocation) return;
    if (sessionStorage.getItem("pgm_geo_asked")) return;
    sessionStorage.setItem("pgm_geo_asked", "1");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest: { id: string; label: string } | null = null;
        let nearestKm = Infinity;
        for (const c of cities) {
          const meta = getCityBySlug(c.id);
          if (meta?.lat == null || meta?.lng == null) continue;
          const km = distanceKm(latitude, longitude, meta.lat, meta.lng);
          if (km < nearestKm) {
            nearestKm = km;
            nearest = c;
          }
        }
        if (nearest) {
          const record: NearMe = { ...nearest, lat: latitude, lng: longitude };
          setCity(nearest.id);
          setNearMeCity(nearest.label);
          setUserLoc({ lat: latitude, lng: longitude });
          sessionStorage.setItem("pgm_near_me", JSON.stringify(record));
        }
      },
      () => {
        // denied, unavailable, or timed out — default India-wide view stays as-is
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately excludes `cities` (only its length matters) and setters
  }, [cities.length, nearMeCity]);

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (city !== "any" && l.city_slug !== city) return false;
        if (gender !== "any" && l.pg_gender !== gender) return false;
        if (budget !== "any" && l.price_min != null && l.price_min > Number(budget)) return false;
        if (sharing !== "any" && !l.sharing_types.includes(sharing)) return false;
        const t = q.trim().toLowerCase();
        if (t && !`${l.name} ${l.locality} ${l.address}`.toLowerCase().includes(t)) return false;
        return true;
      }),
    [listings, q, city, gender, budget, sharing]
  );

  useEffect(() => {
    const el = mapEl.current;
    if (!el || mapRef.current) return;
    const map = L.map(el, {
      scrollWheelZoom: true, // wheel/trackpad zoom on desktop; touch pinch-zoom is on by default
      zoomControl: false,
      minZoom: 5, // stops zooming out far enough to lose India in the surrounding region
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 0.7, // soft resistance at the edge rather than a hard stop
    }).setView(INDIA_CENTER, 5);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fullscreens the whole overlay (map + filter bar + pills), not just the
  // raw Leaflet div, so the filters stay usable in fullscreen too. Leaflet
  // needs an explicit invalidateSize() after any container resize.
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      rootRef.current?.requestFullscreen().catch(() => {
        // Fullscreen API unavailable/blocked (e.g. iOS Safari) — button simply no-ops
      });
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;
    group.clearLayers();

    if (userLoc) {
      L.circleMarker([userLoc.lat, userLoc.lng], { radius: 20, color: "transparent", fillColor: "#2563eb", fillOpacity: 0.15 }).addTo(group);
      L.circleMarker([userLoc.lat, userLoc.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 })
        .bindTooltip("You are here", { direction: "top", offset: [0, -8] })
        .addTo(group);
    }

    const pts: L.LatLngExpression[] = [];
    for (const l of filtered) {
      if (l.lat == null || l.lng == null) continue;
      pts.push([l.lat, l.lng]);
      L.marker([l.lat, l.lng], { icon: pinIcon(l) })
        .bindPopup(popupHtml(l), {
          offset: [0, -8],
          // Keeps popups clear of the floating filter bar (~180px tall on
          // mobile when it wraps to two rows) and the bottom count badge —
          // without this Leaflet's auto-pan doesn't know that overlay exists
          // and a popup near the top renders partly hidden underneath it.
          autoPanPaddingTopLeft: L.point(20, 180),
          autoPanPaddingBottomRight: L.point(20, 60),
        })
        .addTo(group);
    }
    if (userLoc) {
      // Centers tightly on the seeker's actual position rather than the
      // wider bounds of every pin in their nearest city.
      map.flyTo([userLoc.lat, userLoc.lng], 13);
    } else if (pts.length === 1) {
      map.flyTo(pts[0], 14);
    } else if (pts.length > 1) {
      map.flyToBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 12 });
    } else {
      map.flyTo(INDIA_CENTER, 5);
    }
  }, [filtered, userLoc]);

  return (
    <div ref={rootRef} className="relative bg-white">
      <style>{MAP_CSS}</style>
      <div
        ref={mapEl}
        className={`pgm-map relative z-0 w-full ${isFullscreen ? "h-full" : "h-[480px] md:h-[560px]"}`}
        role="application"
        aria-label="Interactive map of verified PG listings across Indian cities — use the search bar and filters above the map to filter pins"
      />

      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"}
        className="absolute bottom-24 right-4 z-[1100] grid h-9 w-9 place-items-center rounded-lg border border-grey-100 bg-white text-grey-700 shadow-[var(--shadow-card)] transition hover:text-primary"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1100] p-3 md:p-5">
        <div
          className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2 rounded-2xl border border-border bg-card/95 p-3 backdrop-blur-xl lg:flex-row lg:items-center"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-grey-100 bg-white px-3 focus-within:border-primary/60">
            <Search className="h-4 w-4 shrink-0 text-grey-500" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search PGs, areas, landmarks…"
              aria-label="Search PGs, areas or landmarks on the map"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-grey-500"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <MapSelect label="City" value={city} onChange={setCity} options={[{ id: "any", label: "All cities" }, ...cities]} />
            <MapSelect label="Gender" value={gender} onChange={setGender} options={[...GENDER_OPTIONS]} />
            <MapSelect label="Budget" value={budget} onChange={setBudget} options={BUDGET_OPTIONS} />
            <MapSelect
              label="Sharing"
              value={sharing}
              onChange={setSharing}
              options={[{ id: "any", label: "Any sharing" }, ...SHARING_TYPES.map((s) => ({ id: s, label: s }))]}
            />
          </div>
        </div>
        {nearMeCity && (
          <div className="pointer-events-auto mx-auto mt-2 flex max-w-4xl">
            <button
              onClick={() => {
                setCity("any");
                setNearMeCity(null);
                setUserLoc(null);
                sessionStorage.removeItem("pgm_near_me");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"
            >
              <LocateFixed className="h-3.5 w-3.5" /> Showing PGs near you — {nearMeCity}
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-[1100] rounded-full border border-grey-100 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-grey-900 backdrop-blur">
        {filtered.length} {filtered.length === 1 ? "PG" : "PGs"} in view
      </div>
    </div>
  );
}

function MapSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Filter map by ${label}`}
      className="h-10 rounded-xl border border-grey-100 bg-white px-2.5 text-xs font-medium text-grey-900 outline-none focus:border-primary/60"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
