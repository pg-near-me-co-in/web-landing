#!/usr/bin/env node
/**
 * Generates public/brand/og-image.png (1200×630) from the brand logo icon
 * on the reference-theme gradient. Re-run after changing the logo:
 *   node scripts/make-og-image.js
 */
const sharp = require("sharp");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "brand", "og-image.png");
const LOGO = path.join(__dirname, "..", "public", "brand", "logo-icon.png");

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#443C99"/>
      <stop offset="55%" stop-color="#534AB7"/>
      <stop offset="100%" stop-color="#7F77DD"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="220" fill="#AFA9EC" opacity="0.18"/>
  <circle cx="120" cy="590" r="180" fill="#5DCAA5" opacity="0.14"/>
  <text x="380" y="300" font-family="DejaVu Sans, Arial, sans-serif" font-size="86" font-weight="bold" fill="#FFFFFF">PG Near Me</text>
  <text x="384" y="372" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" fill="#E8ECF0">Verified PGs, hostels &amp; shared rooms</text>
  <text x="384" y="424" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" fill="#E8ECF0">across India — zero brokerage.</text>
  <text x="384" y="510" font-family="DejaVu Sans Mono, monospace" font-size="26" fill="#5DCAA5">pgnearme.co.in</text>
</svg>`;

async function main() {
  const logo = await sharp(LOGO)
    .resize(190, 190, { fit: "contain" })
    .png()
    .toBuffer();

  // rounded-corner mask for the logo tile
  const mask = Buffer.from(
    `<svg width="190" height="190"><rect width="190" height="190" rx="42" fill="#fff"/></svg>`
  );
  const roundedLogo = await sharp(logo)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: roundedLogo, left: 150, top: 220 }])
    .png()
    .toFile(OUT);
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
