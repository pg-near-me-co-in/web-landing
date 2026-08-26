"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPriceRange, GENDER_LABEL, SHARING_TYPES } from "@/lib/format";
import { getCityBySlug } from "@/lib/data/cities";

/**
 * Interactive PG discovery map (client-only — lazy loaded from the
 * homepage). Pins are live-filtered by the overlay search bar; popups
 * deep-link to listing pages. SEO-critical content (the crawlable listing
 * links list) stays server-rendered alongside this on the homepage.
 */

const INDIA_CENTER: [number, number] = [21.5, 76.5];

const MAP_CSS = `
.pgm-pin-wrap { background: transparent; border: none; }
.pgm-pin {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 56px; padding: 7px 10px; border-radius: 999px;
  background: var(--color-primary); color: #fff;
  font: 700 12px/1 var(--font-sans); letter-spacing: 0.01em; white-space: nowrap;
  border: 2px solid #ffffff; box-shadow: 0 8px 18px -8px rgb(15 18 25 / 0.45);
  transition: transform .15s ease; cursor: pointer;
}
.pgm-pin:hover { transform: scale(1.08); }
.pgm-map .leaflet-popup-content-wrapper {
  border-radius: 16px; border: 1px solid var(--color-border);
}
.pgm-map .leaflet-popup-content { margin: 14px 16px; font-family: var(--font-sans); line-height: 1.45; }
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

function priceIcon(min: number) {
  const short = (min / 1000).toFixed(1).replace(/\.0$/, "");
  return L.divIcon({
    className: "pgm-pin-wrap",
    html: `<div class="pgm-pin">₹${esc(short)}k</div>`,
    iconSize: [72, 32],
    iconAnchor: [36, 16],
    popupAnchor: [0, -14],
  });
}

function popupHtml(l: Listing) {
  const city = getCityBySlug(l.city_slug)?.name ?? "India";
  return `
    <div class="pgm-pop">
      <div class="pgm-pop-name">${esc(l.name)}</div>
      <div class="pgm-pop-loc">${esc(l.locality)}, ${esc(city)} · ${esc(GENDER_LABEL[l.pg_gender])}</div>
      <div class="pgm-pop-tags">
        <span>${esc(l.sharing_types[0] ?? "Shared")}</span>
        <span>${esc(formatPriceRange(l.price_min, l.price_max))}</span>
        <span>★ ${l.trust_score.toFixed(1)}</span>
      </div>
      <a class="pgm-pop-link" href="/pg/${encodeURIComponent(l.city_slug)}/${encodeURIComponent(l.slug)}" aria-label="View details for ${esc(l.name)}">View details →</a>
    </div>`;
}

export default function HomeMap({ listings }: { listings: Listing[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("any");
  const [gender, setGender] = useState("any");
  const [budget, setBudget] = useState("any");
  const [sharing, setSharing] = useState("any");

  const cities = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(l.city_slug, getCityBySlug(l.city_slug)?.name ?? l.city_slug);
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [listings]);

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (city !== "any" && l.city_slug !== city) return false;
        if (gender !== "any" && l.pg_gender !== gender) return false;
        if (budget !== "any" && l.price_min > Number(budget)) return false;
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
    const map = L.map(el, { scrollWheelZoom: false, zoomControl: false }).setView(INDIA_CENTER, 5);
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

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;
    group.clearLayers();
    const pts: L.LatLngExpression[] = [];
    for (const l of filtered) {
      if (l.lat == null || l.lng == null) continue;
      pts.push([l.lat, l.lng]);
      L.marker([l.lat, l.lng], { icon: priceIcon(l.price_min) })
        .bindPopup(popupHtml(l), { offset: [0, -6] })
        .addTo(group);
    }
    if (pts.length === 1) map.flyTo(pts[0], 14);
    else if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.25));
    else map.flyTo(INDIA_CENTER, 5);
  }, [filtered]);

  return (
    <div className="relative">
      <style>{MAP_CSS}</style>
      <div
        ref={mapEl}
        className="pgm-map relative z-0 h-[480px] w-full md:h-[560px]"
        role="application"
        aria-label="Interactive map of verified PG listings across Indian cities — use the search bar and filters above the map to filter pins"
      />

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
