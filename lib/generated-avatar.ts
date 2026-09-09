/** Deterministic hash → index, used so a listing with no real photos always
 *  gets the same generated look on every render (no database column needed). */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Tasteful gradient pairs — brand primary plus a handful of complementary hues. */
const PALETTE: { from: string; to: string }[] = [
  { from: "#534AB7", to: "#8B7FE8" }, // brand primary → lilac
  { from: "#0E7C7B", to: "#5FCFC0" }, // teal
  { from: "#C2410C", to: "#F59E0B" }, // amber
  { from: "#BE185D", to: "#F472B6" }, // pink
  { from: "#1D4ED8", to: "#60A5FA" }, // blue
  { from: "#15803D", to: "#4ADE80" }, // green
  { from: "#7C2D12", to: "#EA580C" }, // rust
  { from: "#4338CA", to: "#818CF8" }, // indigo
];

/** No real photo on a listing → this generates a consistent look from its own
 *  name/id instead of falling back to interchangeable stock photography. */
export function avatarSpec(id: string, name: string): { from: string; to: string; initials: string } {
  const hash = stableHash(id || name);
  const { from, to } = PALETTE[hash % PALETTE.length];
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : (words[0]?.slice(0, 2) ?? "PG").toUpperCase();
  return { from, to, initials };
}

/** Raw SVG markup for non-React contexts (Leaflet marker/popup HTML strings). */
export function avatarSvgMarkup(id: string, name: string, size = 96): string {
  const { from, to, initials } = avatarSpec(id, name);
  const gradId = `ag${stableHash(id || name)}`;
  // viewBox is a fixed 100x100 unit box regardless of `size` — width/height below
  // control the actual rendered pixel dimensions, so font-size stays a constant
  // fraction (36%) of the box either way.
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="100" height="100" fill="url(#${gradId})"/>
    <text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="system-ui, sans-serif" font-weight="700" font-size="36">${initials}</text>
  </svg>`;
}
