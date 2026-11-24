// Converts raw Higgsfield PNGs (../assets-raw) into AVIF + WebP sizes in public/media.
// Run: node scripts/optimize.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const RAW = '../assets-raw/';
const OUT = 'public/media/';
mkdirSync(OUT, { recursive: true });

async function emit(input, name, widths, { avif = 50, webp = 72 } = {}) {
  for (const w of widths) {
    const base = sharp(input).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: avif, effort: 6 }).toFile(`${OUT}${name}-${w}.avif`);
    await base.clone().webp({ quality: webp, alphaQuality: 90 }).toFile(`${OUT}${name}-${w}.webp`);
  }
}

// Alpha bounding box so cutouts carry no empty margins.
async function bbox(file) {
  const { data, info } = await sharp(RAW + file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
  return { x0, y0, x1, y1 };
}

// The three fabric variants share ONE crop (union box) so crossfades line up.
const dunes = ['dune_ember', 'dune_chalk', 'dune_cocoa'];
const boxes = await Promise.all(dunes.map((f) => bbox(f + '.png')));
const u = boxes.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
const region = { left: u.x0, top: u.y0, width: u.x1 - u.x0 + 1, height: u.y1 - u.y0 + 1 };
for (const f of dunes) {
  const buf = await sharp(RAW + f + '.png').extract(region).toBuffer();
  await emit(buf, f.replace('_', '-'), [1800, 1000, 640], { avif: 55 });
}
console.log('dune crop', region);

for (const f of ['pebble', 'crumb']) {
  const b = await bbox(f + '.png');
  const buf = await sharp(RAW + f + '.png').extract({ left: b.x0, top: b.y0, width: b.x1 - b.x0 + 1, height: b.y1 - b.y0 + 1 }).toBuffer();
  await emit(buf, f, [1000, 560]);
}

await emit(RAW + 'room_16x9.png', 'room', [2400, 1600, 960], { avif: 45 });
await emit(RAW + 'room_9x16.png', 'room-tall', [900, 600], { avif: 45 });
for (const f of ['macro', 'workshop', 'anatomy']) await emit(RAW + f + '.png', f, [1100, 640], { avif: 48 });
await emit(RAW + 'corner.png', 'corner', [1400, 800], { avif: 48 });
for (const f of ['privacy', 'imprint']) await emit(RAW + f + '.png', f, [1400, 800], { avif: 48 });
// Social share image (JPEG, 1200x630) from the room shot.
await sharp(RAW + 'room_16x9.png').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 78, mozjpeg: true }).toFile(OUT + 'og.jpg');
console.log('done');
