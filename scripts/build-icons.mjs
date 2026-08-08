// =============================================================================
// build-icons.mjs — regenerate every app icon from the CURRENT lockup.
//
//   node scripts/build-icons.mjs
//
// 🔴 WHY THE ICONS ARE GENERATED AND NOT HAND-DRAWN. The three files Next ships
// as file conventions (`app/favicon.ico`, `app/icon.*`, `app/apple-icon.png`)
// were a SEPARATE, EARLIER mark — a hand-built 512x512 gold-gradient shield in
// `icon.svg` that no longer matched the lockup used in the header, on the login
// screen and in the portal. Two marks for one brand, and nothing tied them
// together, so the tab icon quietly drifted from the site.
//
// They are now all cut from `public/synergy-logo_1.webp` — the same file
// `LogoLockup` renders — so re-running this after the logo changes keeps them in
// step instead of leaving the favicon behind again.
//
// 🔴 THE SHIELD IS CROPPED, NOT THE WHOLE LOCKUP. The lockup is 2.31:1; squashed
// into a square tab icon the wordmark would be illegible mush at 16px. The
// shield is the part that reads at that size, and its bounds are FOUND rather
// than hard-coded: the alpha column profile locates the dense left block and the
// first sustained transparent gutter before the wordmark.
//
// 🔴 THE PLATE IS NAVY, AND THAT IS THE SAME FINDING AS THE HEADER'S. The mark's
// artwork measures mean luminance 0.7219 — bright gold. On a light browser tab
// strip that is ~1.36:1 and effectively invisible; on navy it is ~12.78:1. A
// transparent favicon would vanish for every user on a light theme, and nothing
// would ever flag it. Full-bleed navy, no rounded corners: the OS and browser
// apply their own masking, and pre-rounding double-rounds on iOS.
// =============================================================================
import sharp from "sharp";
import { writeFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "public/synergy-logo_1.webp");
const NAVY = { r: 0x0d, g: 0x1b, b: 0x2a, alpha: 1 };
/** Share of the square the shield occupies.
 *  🔴 TUNED AT 16px, NOT CHOSEN BY EYE AT 512. The shield is 176x221 (0.80
 *  aspect), so it can never fill a square tile — it is height-constrained. Swept
 *  against the 16x16 render: 0.78 gave a 10x12 mark and 45/256 non-plate pixels,
 *  0.86 gives 11x14 and 54, 0.92 gives 12x15 and 70 but leaves almost no margin
 *  and collides with the browser tab strip crop. 0.86 keeps a visible margin and
 *  still gains ~20% mark area over the first pass. */
const INSET = 0.86;

/** Find the shield: dense opaque block on the left, ending at the first gutter. */
async function shieldBox() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const col = [];
  for (let x = 0; x < w; x++) {
    let n = 0;
    for (let y = 0; y < h; y++) if (data[(y * w + x) * c + 3] > 140) n++;
    col.push(n);
  }
  const left = col.findIndex((v) => v > 3);
  let right = w, run = 0;
  for (let x = left; x < w; x++) {
    if (col[x] <= 1) { run++; if (run >= 8) { right = x - run + 1; break; } } else run = 0;
  }
  let top = h, bottom = 0;
  for (let x = left; x < right; x++)
    for (let y = 0; y < h; y++)
      if (data[(y * w + x) * c + 3] > 140) { if (y < top) top = y; if (y > bottom) bottom = y; }
  return { left, top, width: right - left, height: bottom - top + 1 };
}

/** Square icon: shield centred on a navy plate at `size`. */
async function square(box, size) {
  const inner = Math.round(size * INSET);
  const shield = await sharp(SOURCE)
    .extract({ left: box.left, top: box.top, width: box.width, height: box.height })
    .resize({ height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const meta = await sharp(shield).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{
      input: shield,
      left: Math.round((size - meta.width) / 2),
      top: Math.round((size - meta.height) / 2),
    }])
    /* Palette-quantised: the plate is one flat navy and the shield is a
       narrow gold ramp, so 256 colours is lossless to the eye and takes the
       512px icon from ~200KB to ~20KB. A favicon is fetched on every cold
       page load; 200KB for a 16px-rendered mark is not a rounding error. */
    .png({ compressionLevel: 9, palette: true, colours: 256, effort: 10 })
    .toBuffer();
}

/**
 * Minimal ICO container. Modern browsers read PNG-compressed entries, which is
 * what every current favicon generator emits — no BMP/AND-mask encoding needed.
 */
function ico(pngs) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);        // reserved
  head.writeUInt16LE(1, 2);        // type: icon
  head.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const dir = [];
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);            // palette
    e.writeUInt8(0, 3);            // reserved
    e.writeUInt16LE(1, 4);         // colour planes
    e.writeUInt16LE(32, 6);        // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    dir.push(e);
  }
  return Buffer.concat([head, ...dir, ...pngs.map((p) => p.buf)]);
}

const box = await shieldBox();
console.log(`shield found at x${box.left} y${box.top} ${box.width}x${box.height}`);

// app/icon.png — the general-purpose icon Next links as <link rel="icon">.
writeFileSync(join(root, "app/icon.png"), await square(box, 512));

// app/apple-icon.png — Apple's touch icon. 180 is the current iOS size.
writeFileSync(join(root, "app/apple-icon.png"), await square(box, 180));

// app/favicon.ico — 16/32/48, the sizes browsers actually pick from.
const sizes = [16, 32, 48];
writeFileSync(
  join(root, "app/favicon.ico"),
  ico(await Promise.all(sizes.map(async (size) => ({ size, buf: await square(box, size) })))),
);

/* 🔴 THE OLD SVG IS REMOVED, NOT LEFT BESIDE THE NEW PNG. Next treats every
   `app/icon.*` as a convention and emits a <link> for EACH one, so leaving
   icon.svg in place would ship two competing icons and let the browser keep
   choosing the stale mark — the exact "stale favicon pinned in the tab" problem
   app/[locale]/layout.tsx already warns about. */
const oldSvg = join(root, "app/icon.svg");
if (existsSync(oldSvg)) { rmSync(oldSvg); console.log("removed app/icon.svg (superseded by icon.png)"); }

for (const f of ["app/favicon.ico", "app/icon.png", "app/apple-icon.png"]) {
  const { size } = await import("node:fs").then((m) => m.statSync(join(root, f)));
  console.log(`wrote ${f} (${size} bytes)`);
}
