import type { LatLngExpression } from "leaflet";

/** Shared India framing for both Home and Map pages. */
export const INDIA_CENTER: LatLngExpression = [22.5, 79];

/** Hard pan clamp — keeps the camera on the subcontinent. */
export const INDIA_BOUNDS_SW: [number, number] = [6.5, 68];
export const INDIA_BOUNDS_NE: [number, number] = [36.5, 97.5];
