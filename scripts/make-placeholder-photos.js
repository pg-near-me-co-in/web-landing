#!/usr/bin/env node
/**
 * Generates public/placeholders/room-{1..4}.jpg — 4 simple, self-hosted
 * abstract tiles used by src/lib/placeholder-images.ts's
 * placeholderPhotoFor() when a listing has no real photos yet. These are
 * deliberately abstract brand-gradient tiles with a room icon, NOT fake
 * "stock photos" pretending to be real rooms — clearly a placeholder, never
 * hotlinked from a third party. Swap for real licensed photography later by
 * replacing these same 4 files (call sites don't need to change).
 * Re-run: node scripts/make-placeholder-photos.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "placeholders");
const W = 800;
const H = 600;

const VARIANTS = [
  { from: "#443C99", to: "#7F77DD", icon: "bed" },
  { from: "#1D9E75", to: "#5DCAA5", icon: "door" },
  { from: "#534AB7", to: "#AFA9EC", icon: "window" },
  { from: "#16191C", to: "#4C555F", icon: "building" },
];

const ICONS = {
  bed: `<path d="M60 340v-90a30 30 0 0 1 30-30h220a30 30 0 0 1 30 30v90" />
        <path d="M60 340h280" />
        <circle cx="110" cy="250" r="18" />`,
  door: `<rect x="130" y="150" width="140" height="220" rx="6" />
         <circle cx="235" cy="260" r="6" fill="white" stroke="none" />`,
  window: `<rect x="110" y="140" width="180" height="180" rx="8" />
           <line x1="200" y1="140" x2="200" y2="320" />
           <line x1="110" y1="230" x2="290" y2="230" />`,
  building: `<rect x="120" y="120" width="160" height="240" rx="4" />
             <line x1="150" y1="150" x2="150" y2="330" />
             <line x1="180" y1="150" x2="180" y2="330" />
             <line x1="210" y1="150" x2="210" y2="330" />
             <line x1="240" y1="150" x2="240" y2="330" />`,
};

async function makeTile({ from, to, icon }, index) {
  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g transform="translate(${W / 2 - 200}, ${H / 2 - 220})" fill="none" stroke="white" stroke-opacity="0.85" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    ${ICONS[icon]}
  </g>
  <text x="${W / 2}" y="${H - 48}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" fill="white" fill-opacity="0.7">Photo coming soon</text>
</svg>`;
  const out = path.join(OUT_DIR, `room-${index}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(out);
  return out;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = await Promise.all(VARIANTS.map((v, i) => makeTile(v, i + 1)));
  console.log("wrote", files.map((f) => path.relative(process.cwd(), f)).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
