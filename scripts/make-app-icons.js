#!/usr/bin/env node
/**
 * Derives the icon-only brand mark (just the roofline glyph, no wordmark)
 * from the existing Figma export and regenerates every favicon/PWA/
 * apple-touch icon size from it — resolves GLOSSARY_AND_OPEN_QUESTIONS.md
 * open items #11/#12 (no icon-only mark existed before this script).
 * Re-run after changing docs/assets/brand/pg-near-me-logo.svg:
 *   node scripts/make-app-icons.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_SVG = path.join(
  __dirname,
  "..",
  "docs",
  "assets",
  "brand",
  "pg-near-me-logo.svg"
);
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const FAVICON_OUT = path.join(__dirname, "..", "src", "app", "favicon.ico");
const LOGO_ICON_OUT = path.join(__dirname, "..", "public", "brand", "logo-icon.png");

const GRADIENT_DEFS = `
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#443C99"/>
    <stop offset="55%" stop-color="#534AB7"/>
    <stop offset="100%" stop-color="#7F77DD"/>
  </linearGradient>`;

/** Isolate the roofline glyph ("Group 14" — two chevron strokes) from the
 *  full icon+wordmark lockup, render it alone, and trim to its true bounds
 *  so it can be centered precisely on any target canvas. */
async function extractRooflineGlyph() {
  const source = fs.readFileSync(SOURCE_SVG, "utf8");
  const match = source.match(/<g id="Group 14">([\s\S]*?)<\/g>/);
  if (!match) {
    throw new Error(`Could not find the roofline glyph ("Group 14") in ${SOURCE_SVG}`);
  }
  const glyphPaths = match[1].replace(/fill="black"/g, 'fill="#FFFFFF"');
  const svg = `<svg width="447" height="417" viewBox="0 0 447 417" xmlns="http://www.w3.org/2000/svg">${glyphPaths}</svg>`;
  const rendered = await sharp(Buffer.from(svg), { density: 600 }).png().toBuffer();
  return sharp(rendered).trim().toBuffer();
}

async function makeIconTile({ size, glyph, glyphScale, opaque }) {
  const glyphMeta = await sharp(glyph).metadata();
  const glyphW = Math.round(size * glyphScale);
  const glyphH = Math.round((glyphMeta.height / glyphMeta.width) * glyphW);
  const resizedGlyph = await sharp(glyph)
    .resize(glyphW, glyphH)
    .toBuffer();

  const bgSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs>${GRADIENT_DEFS}</defs><rect width="${size}" height="${size}" fill="url(#bg)"/></svg>`;
  let img = sharp(Buffer.from(bgSvg)).composite([
    {
      input: resizedGlyph,
      left: Math.round((size - glyphW) / 2),
      top: Math.round((size - glyphH) / 2),
    },
  ]);
  if (opaque) img = img.flatten({ background: "#534AB7" });
  return img.png().toBuffer();
}

async function makeFavicon(glyph) {
  // ICO container with 16/32/48 px frames, each PNG-encoded (supported by
  // every modern browser + Windows/macOS); avoids an extra ICO-writer
  // dependency by hand-rolling the (very small) ICO directory format.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((size) => makeIconTile({ size, glyph, glyphScale: 0.62, opaque: true }))
  );

  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * sizes.length;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);

  const dirEntries = [];
  const imageBuffers = [];
  sizes.forEach((size, i) => {
    const png = pngs[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    offset += png.length;
    dirEntries.push(entry);
    imageBuffers.push(png);
  });

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function main() {
  const glyph = await extractRooflineGlyph();

  const [icon192, icon512, maskable192, maskable512, appleTouch, favicon, logoIcon] =
    await Promise.all([
      makeIconTile({ size: 192, glyph, glyphScale: 0.62 }),
      makeIconTile({ size: 512, glyph, glyphScale: 0.62 }),
      // Maskable: glyph shrunk to sit inside Android's ~80% safe-zone circle
      // (current maskable files were unpadded copies of the flat icon — a
      // real latent PWA bug this fixes).
      makeIconTile({ size: 192, glyph, glyphScale: 0.42 }),
      makeIconTile({ size: 512, glyph, glyphScale: 0.42 }),
      // apple-touch-icon: opaque, no alpha — iOS ignores/mishandles alpha.
      makeIconTile({ size: 180, glyph, glyphScale: 0.62, opaque: true }),
      makeFavicon(glyph),
      // public/brand/logo-icon.png — rendered in-page next to live "PG Near
      // Me" text (src/components/logo.tsx), so it must be icon-only too;
      // the old file baked "PG NEAR ME" text into the tile, illegible at
      // the ~34px it's actually displayed at.
      makeIconTile({ size: 256, glyph, glyphScale: 0.62 }),
    ]);

  fs.writeFileSync(path.join(ICONS_DIR, "icon-192.png"), icon192);
  fs.writeFileSync(path.join(ICONS_DIR, "icon-512.png"), icon512);
  fs.writeFileSync(path.join(ICONS_DIR, "maskable-192.png"), maskable192);
  fs.writeFileSync(path.join(ICONS_DIR, "maskable-512.png"), maskable512);
  fs.writeFileSync(path.join(ICONS_DIR, "apple-touch-icon.png"), appleTouch);
  fs.writeFileSync(FAVICON_OUT, favicon);
  fs.writeFileSync(LOGO_ICON_OUT, logoIcon);

  console.log(
    "wrote icon-192.png, icon-512.png, maskable-192.png, maskable-512.png, apple-touch-icon.png, favicon.ico, brand/logo-icon.png"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
