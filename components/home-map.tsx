"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, LocateFixed, X, Maximize2, Minimize2, Loader2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPriceRange, genderLabel, placeName, GENDER_COLOR, GENDER_COLOR_FALLBACK, SHARING_TYPES } from "@/lib/format";
import { getCityBySlug } from "@/lib/data/cities";
import { avatarSvgMarkup } from "@/lib/generated-avatar";
import { INDIA_BOUNDS_NE, INDIA_BOUNDS_SW, INDIA_CENTER } from "@/lib/map-india";

/**
 * Interactive PG discovery map — shared by Home and Map pages.
 * At low zoom shows one pin per city (clean overview); zooms in to listing pins.
 */

const INDIA_BOUNDS = L.latLngBounds(INDIA_BOUNDS_SW, INDIA_BOUNDS_NE);
const CITY_CLUSTER_MAX_ZOOM = 7;

const MAP_CSS = `
/* NEVER set position on .leaflet-marker-icon / .pgm-pin — Leaflet needs position:absolute */
.pgm-pin {
  background: transparent !important;
  border: none !important;
  width: 48px !important;
  height: 48px !important;
}
.pgm-pin-inner {
  position: relative;
  width: 48px;
  height: 48px;
}
.pgm-pin-ring {
  width: 48px; height: 48px; border-radius: 50%; padding: 3px;
  box-shadow: 0 8px 18px -8px rgb(15 18 25 / 0.45);
  transition: transform .15s ease;
  cursor: pointer;
}
.pgm-pin:hover .pgm-pin-ring { transform: scale(1.08); }
.pgm-pin.is-selected .pgm-pin-ring {
  transform: scale(1.14);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 50%, transparent), 0 8px 18px -8px rgb(15 18 25 / 0.5);
}
.pgm-pin-photo {
  width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff;
  background-size: cover; background-position: center; background-color: var(--color-grey-10);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.pgm-pin-photo svg { width: 100%; height: 100%; display: block; }
.pgm-pin-price {
  position: absolute; bottom: -4px; right: -8px; padding: 2px 7px; border-radius: 999px;
  background: var(--color-primary); color: #fff; font: 700 10px/1.6 var(--font-sans);
  border: 2px solid #fff; white-space: nowrap; pointer-events: none;
}
.pgm-city-pin {
  background: transparent !important;
  border: none !important;
  width: 56px !important;
  height: 56px !important;
}
.pgm-city-inner { position: relative; width: 56px; height: 56px; }
.pgm-city-dot {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--color-primary);
  border: 3px solid #fff;
  box-shadow: 0 10px 22px -8px rgb(83 74 183 / 0.55);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  transition: transform .15s ease;
}
.pgm-city-pin:hover .pgm-city-dot { transform: scale(1.08); }
.pgm-city-pin.is-selected .pgm-city-dot {
  transform: scale(1.12);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 40%, transparent), 0 10px 22px -8px rgb(83 74 183 / 0.55);
}
.pgm-city-count { font: 800 14px/1 var(--font-sans); }
.pgm-city-label { font: 700 8px/1.2 var(--font-sans); letter-spacing: .04em; text-transform: uppercase; opacity: .9; margin-top: 2px; }
.pgm-user {
  background: transparent !important;
  border: none !important;
  width: 22px !important;
  height: 22px !important;
}
.pgm-user-inner { position: relative; width: 22px; height: 22px; }
.pgm-user-dot {
  position: absolute; inset: 3px; border-radius: 50%;
  background: #2563eb; border: 3px solid #fff;
  box-shadow: 0 2px 8px rgb(37 99 235 / 0.45);
  z-index: 2;
}
.pgm-user-pulse {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgb(37 99 235 / 0.35);
  animation: pgm-pulse 1.8s ease-out infinite;
  z-index: 1;
}
@keyframes pgm-pulse {
  0% { transform: scale(0.6); opacity: .7; }
  70% { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
.pgm-map .leaflet-popup-content-wrapper {
  border-radius: 16px; border: 1px solid var(--color-border);
}
.pgm-map .leaflet-popup-content { margin: 14px 16px; font-family: var(--font-sans); line-height: 1.45; }
.pgm-pop { display: flex; gap: 10px; min-width: 200px; max-width: 260px; }
.pgm-pop-thumb {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 2px 6px -2px rgb(15 18 25 / 0.4);
  background-size: cover; background-position: center; background-color: var(--color-grey-10);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.pgm-pop-thumb svg { width: 100%; height: 100%; display: block; }
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
  color: var(--color-primary); text-decoration: none; background: none; border: none; padding: 0; cursor: pointer;
}
.pgm-pop-link:hover { text-decoration: underline; }
.pgm-map .leaflet-control-attribution {
  font-size: 10px;
  margin: 0 8px 8px 0 !important;
  border-radius: 8px;
  overflow: hidden;
}
.pgm-map .leaflet-control-zoom {
  border: 1px solid var(--color-border) !important;
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-left: 12px !important;
  margin-bottom: 12px !important;
}
.pgm-map .leaflet-control-zoom a {
  width: 34px !important; height: 34px !important; line-height: 34px !important;
  font-size: 16px !important; color: var(--color-grey-900) !important;
  background: #fff !important;
}
.pgm-map .leaflet-control-zoom a:hover { color: var(--color-primary) !important; }
/* Soft vignette — mutes the map edges (other countries) without a jagged polygon */
.pgm-vignette {
  pointer-events: none;
  position: absolute; inset: 0; z-index: 400;
  background:
    radial-gradient(ellipse 72% 68% at 50% 48%, transparent 40%, rgb(15 18 25 / 0.18) 72%, rgb(15 18 25 / 0.45) 100%);
}
`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function inIndia(lat: number, lng: number) {
  return lat >= INDIA_BOUNDS_SW[0] && lat <= INDIA_BOUNDS_NE[0] && lng >= INDIA_BOUNDS_SW[1] && lng <= INDIA_BOUNDS_NE[1];
}

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
  { id: "male", label: "Boys-only" },
  { id: "female", label: "Girls-only" },
  { id: "unisex", label: "Co-ed" },
];

function thumbFill(l: Listing): string {
  const photo = l.images[0]?.storage_path;
  return photo ? `background-image:url('${photo.replace(/'/g, "%27")}')` : "";
}
function thumbInner(l: Listing, size: number): string {
  return l.images[0]?.storage_path ? "" : avatarSvgMarkup(l.id, l.name, size);
}

function listingPinIcon(l: Listing, selected: boolean) {
  const priceLabel = l.price_min != null ? `₹${(l.price_min / 1000).toFixed(1).replace(/\.0$/, "")}k` : "PG";
  const ringColor = l.pg_gender ? GENDER_COLOR[l.pg_gender] : GENDER_COLOR_FALLBACK;
  return L.divIcon({
    className: `pgm-pin${selected ? " is-selected" : ""}`,
    html: `<div class="pgm-pin-inner">
      <div class="pgm-pin-ring" style="background:${ringColor}">
        <div class="pgm-pin-photo" style="${thumbFill(l)}">${thumbInner(l, 42)}</div>
      </div>
      <div class="pgm-pin-price">${esc(priceLabel)}</div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
  });
}

function cityPinIcon(name: string, count: number, selected: boolean) {
  return L.divIcon({
    className: `pgm-city-pin${selected ? " is-selected" : ""}`,
    html: `<div class="pgm-city-inner">
      <div class="pgm-city-dot">
        <span class="pgm-city-count">${count}</span>
        <span class="pgm-city-label">${esc(name.slice(0, 8))}</span>
      </div>
    </div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -30],
  });
}

function userLocIcon() {
  return L.divIcon({
    className: "pgm-user",
    html: `<div class="pgm-user-inner"><div class="pgm-user-pulse"></div><div class="pgm-user-dot"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
        <a class="pgm-pop-link" href="/pg/${encodeURIComponent(l.city_slug)}/${encodeURIComponent(l.slug)}">View details →</a>
      </div>
    </div>`;
}

interface NearMe {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

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

export interface HomeMapProps {
  listings: Listing[];
  onCityFocus?: (citySlug: string | null) => void;
  focusedCity?: string | null;
}

export default function HomeMap({ listings, onCityFocus, focusedCity }: HomeMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const haloRef = useRef<L.Circle | null>(null);
  const viewKeyRef = useRef<string>("");
  const locatingAnimRef = useRef(false);

  const [q, setQ] = useState("");
  const [city, setCity] = useState(() => focusedCity ?? readCachedNearMe(listings)?.id ?? "any");
  const [gender, setGender] = useState("any");
  const [budget, setBudget] = useState("any");
  const [sharing, setSharing] = useState("any");
  const [nearMeCity, setNearMeCity] = useState<string | null>(() => readCachedNearMe(listings)?.label ?? null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(() => {
    const cached = readCachedNearMe(listings);
    return cached ? { lat: cached.lat, lng: cached.lng } : null;
  });
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(5);
  const [locating, setLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onCityFocusRef = useRef(onCityFocus);
  onCityFocusRef.current = onCityFocus;

  const cities = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(l.city_slug, getCityBySlug(l.city_slug)?.name ?? l.city_slug);
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [listings]);

  const changeCity = useCallback((next: string) => {
    setCity(next);
    setNearMeCity(null);
    onCityFocusRef.current?.(next === "any" ? null : next);
  }, []);

  useEffect(() => {
    if (focusedCity == null) return;
    if (focusedCity !== city) {
      setCity(focusedCity);
      setNearMeCity(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedCity]);

  const applyNearMe = useCallback(
    (latitude: number, longitude: number, animate: boolean) => {
      if (!inIndia(latitude, longitude)) {
        // Outside India — just frame the whole country, don't fake a "near me" city.
        setNearMeCity(null);
        setUserLoc(null);
        return;
      }
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
      if (!nearest) return;
      const record: NearMe = { ...nearest, lat: latitude, lng: longitude };
      setCity(nearest.id);
      setNearMeCity(nearest.label);
      setUserLoc({ lat: latitude, lng: longitude });
      sessionStorage.setItem("pgm_near_me", JSON.stringify(record));
      onCityFocusRef.current?.(nearest.id);

      if (animate && mapRef.current) {
        locatingAnimRef.current = true;
        const map = mapRef.current;
        map.flyTo(INDIA_CENTER, 5, { animate: true, duration: 0.45, easeLinearity: 0.4 });
        window.setTimeout(() => {
          map.flyTo([latitude, longitude], 13, { animate: true, duration: 1.8, easeLinearity: 0.22 });
          viewKeyRef.current = `near-me:${latitude.toFixed(3)},${longitude.toFixed(3)}`;
          window.setTimeout(() => {
            locatingAnimRef.current = false;
          }, 1900);
        }, 500);
      } else {
        locatingAnimRef.current = false;
        viewKeyRef.current = "";
      }
    },
    [cities]
  );

  useEffect(() => {
    if (cities.length === 0 || nearMeCity) return;
    if (!navigator.geolocation) return;
    if (sessionStorage.getItem("pgm_geo_asked")) return;
    sessionStorage.setItem("pgm_geo_asked", "1");
    navigator.geolocation.getCurrentPosition(
      (pos) => applyNearMe(pos.coords.latitude, pos.coords.longitude, true),
      () => {},
      { timeout: 8000, maximumAge: 300_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length, nearMeCity, applyNearMe]);

  const requestLocate = () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyNearMe(pos.coords.latitude, pos.coords.longitude, true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60_000 }
    );
  };

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (l.lat == null || l.lng == null || !inIndia(l.lat, l.lng)) return false;
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

  const cityClusters = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; lat: number; lng: number; count: number }>();
    for (const l of filtered) {
      if (l.lat == null || l.lng == null) continue;
      const existing = map.get(l.city_slug);
      if (existing) {
        existing.count += 1;
      } else {
        const meta = getCityBySlug(l.city_slug);
        map.set(l.city_slug, {
          slug: l.city_slug,
          name: meta?.name ?? l.city_slug,
          lat: meta?.lat ?? l.lat,
          lng: meta?.lng ?? l.lng,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [filtered]);

  const showCityPins = zoom <= CITY_CLUSTER_MAX_ZOOM && city === "any";

  useEffect(() => {
    const el = mapEl.current;
    if (!el || mapRef.current) return;
    const map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: false,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 1.0,
    }).setView(INDIA_CENTER, 5);

    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setZoom(map.getZoom());
    map.on("zoomend", () => setZoom(map.getZoom()));

    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      haloRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => mapRef.current?.invalidateSize(), 120);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen().catch(() => {});
  };

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;
    group.clearLayers();
    if (haloRef.current) {
      map.removeLayer(haloRef.current);
      haloRef.current = null;
    }

    if (userLoc && inIndia(userLoc.lat, userLoc.lng)) {
      L.marker([userLoc.lat, userLoc.lng], { icon: userLocIcon(), zIndexOffset: 1000 })
        .bindTooltip("You are here", { direction: "top", offset: [0, -10] })
        .addTo(group);
    }

    if (city !== "any") {
      const meta = getCityBySlug(city);
      if (meta?.lat != null && meta?.lng != null) {
        haloRef.current = L.circle([meta.lat, meta.lng], {
          radius: 14_000,
          color: "#534AB7",
          weight: 2,
          opacity: 0.5,
          fillColor: "#534AB7",
          fillOpacity: 0.1,
          interactive: false,
        }).addTo(map);
      }
    }

    const pts: L.LatLngExpression[] = [];

    if (showCityPins) {
      for (const c of cityClusters) {
        pts.push([c.lat, c.lng]);
        const marker = L.marker([c.lat, c.lng], {
          icon: cityPinIcon(c.name, c.count, focusedCity === c.slug || city === c.slug),
        });
        marker.bindPopup(
          `<div>
            <div class="pgm-pop-name">${esc(c.name)}</div>
            <div class="pgm-pop-loc">${c.count} PG${c.count === 1 ? "" : "s"} on the map</div>
            <button type="button" class="pgm-pop-link" data-zoom-city="${esc(c.slug)}">Zoom into city →</button>
          </div>`,
          { offset: [0, -8], autoPanPaddingTopLeft: L.point(24, 200), autoPanPaddingBottomRight: L.point(24, 80) }
        );
        marker.on("click", () => {
          onCityFocusRef.current?.(c.slug);
        });
        marker.on("popupopen", () => {
          const btn = document.querySelector<HTMLButtonElement>(`button[data-zoom-city="${c.slug}"]`);
          btn?.addEventListener(
            "click",
            () => {
              changeCity(c.slug);
              map.flyTo([c.lat, c.lng], 12, { animate: true, duration: 1.2 });
              viewKeyRef.current = `city:${c.slug}`;
            },
            { once: true }
          );
        });
        marker.addTo(group);
      }
    } else {
      for (const l of filtered) {
        if (l.lat == null || l.lng == null) continue;
        pts.push([l.lat, l.lng]);
        const marker = L.marker([l.lat, l.lng], { icon: listingPinIcon(l, selectedPinId === l.id) });
        marker.bindPopup(popupHtml(l), {
          offset: [0, -8],
          autoPanPaddingTopLeft: L.point(24, 200),
          autoPanPaddingBottomRight: L.point(24, 80),
        });
        marker.on("click", () => {
          setSelectedPinId(l.id);
          onCityFocusRef.current?.(l.city_slug);
        });
        marker.on("popupclose", () => setSelectedPinId((id) => (id === l.id ? null : id)));
        marker.addTo(group);
      }
    }

    if (locatingAnimRef.current) return;

    let nextKey = "india";
    if (nearMeCity && userLoc) nextKey = `near-me:${userLoc.lat.toFixed(3)},${userLoc.lng.toFixed(3)}`;
    else if (city !== "any") nextKey = `city:${city}:${filtered.length}`;
    else if (showCityPins) nextKey = `cities:${cityClusters.length}`;
    else if (pts.length > 0) nextKey = `results:${pts.length}:${q}:${gender}:${budget}:${sharing}`;

    if (nextKey === viewKeyRef.current) return;
    viewKeyRef.current = nextKey;

    const pad = { paddingTopLeft: L.point(24, 190), paddingBottomRight: L.point(24, 80) };

    if (nearMeCity && userLoc) {
      map.flyTo([userLoc.lat, userLoc.lng], 13, { animate: true, duration: 1.4, easeLinearity: 0.25 });
    } else if (city !== "any") {
      const meta = getCityBySlug(city);
      if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.22), { ...pad, maxZoom: 13, duration: 1.2 });
      else if (pts.length === 1) map.flyTo(pts[0], 13, { animate: true, duration: 1.2 });
      else if (meta?.lat != null && meta?.lng != null) map.flyTo([meta.lat, meta.lng], 11, { animate: true, duration: 1.2 });
    } else if (showCityPins && pts.length > 1) {
      map.flyToBounds(L.latLngBounds(pts).pad(0.35), { ...pad, maxZoom: 6, duration: 1.0 });
    } else if (pts.length === 1) {
      map.flyTo(pts[0], 12, { animate: true, duration: 1.0 });
    } else if (pts.length > 1) {
      map.flyToBounds(L.latLngBounds(pts).pad(0.2), { ...pad, maxZoom: 11, duration: 1.1 });
    } else {
      map.flyTo(INDIA_CENTER, 5, { animate: true, duration: 0.9 });
    }
  }, [
    filtered,
    cityClusters,
    showCityPins,
    userLoc,
    nearMeCity,
    city,
    selectedPinId,
    q,
    gender,
    budget,
    sharing,
    focusedCity,
    changeCity,
  ]);

  const clearNearMe = () => {
    setNearMeCity(null);
    setUserLoc(null);
    sessionStorage.removeItem("pgm_near_me");
    changeCity("any");
    viewKeyRef.current = "";
  };

  const countLabel = showCityPins
    ? `${cityClusters.length} ${cityClusters.length === 1 ? "city" : "cities"}`
    : `${filtered.length} ${filtered.length === 1 ? "PG" : "PGs"}`;

  return (
    <div ref={rootRef} className="relative bg-white">
      <style>{MAP_CSS}</style>
      <div
        ref={mapEl}
        className={`pgm-map relative z-0 w-full ${isFullscreen ? "h-full" : "h-[480px] md:h-[560px]"}`}
        role="application"
        aria-label="Interactive map of verified PG listings across Indian cities"
      />
      <div className="pgm-vignette" aria-hidden />

      <div className="absolute bottom-4 right-4 z-[1100] flex flex-col gap-2">
        <button
          type="button"
          onClick={requestLocate}
          disabled={locating}
          aria-label="Find PGs near my location"
          className="grid h-10 w-10 place-items-center rounded-xl border border-grey-100 bg-white text-grey-700 shadow-[var(--shadow-card)] transition hover:text-primary disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"}
          className="grid h-10 w-10 place-items-center rounded-xl border border-grey-100 bg-white text-grey-700 shadow-[var(--shadow-card)] transition hover:text-primary"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1100] p-3 md:p-5">
        <div
          className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2 rounded-2xl border border-border bg-white/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur-xl lg:flex-row lg:items-center"
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
            <MapSelect label="City" value={city} onChange={changeCity} options={[{ id: "any", label: "All cities" }, ...cities]} />
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
        {(nearMeCity || (city !== "any" && !nearMeCity)) && (
          <div className="pointer-events-auto mx-auto mt-2 flex max-w-4xl flex-wrap gap-2">
            {nearMeCity && (
              <button
                type="button"
                onClick={clearNearMe}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"
              >
                <LocateFixed className="h-3.5 w-3.5" /> Near you — {nearMeCity}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {city !== "any" && !nearMeCity && (
              <button
                type="button"
                onClick={() => changeCity("any")}
                className="inline-flex items-center gap-1.5 rounded-full border border-grey-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-grey-800 shadow-sm"
              >
                {getCityBySlug(city)?.name ?? city}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-[3.25rem] z-[1100] rounded-full border border-grey-100 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-grey-900 shadow-sm backdrop-blur">
        {countLabel}
        {showCityPins ? " · zoom in for PG pins" : city !== "any" ? ` · ${getCityBySlug(city)?.name ?? city}` : " in view"}
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
