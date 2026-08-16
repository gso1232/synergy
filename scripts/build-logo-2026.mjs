// =============================================================================
// build-logo-2026.mjs — turn the supplied lockup PNG into the file the site
// serves. Run it again if the client hands over a new export:
//
//   node scripts/build-logo-2026.mjs "C:/path/to/LATEST SYNERGY.PNG"
//
// 🔴 IT CROPS. IT DOES NOT REDRAW, RECOLOUR OR RE-TRACE.
// The instruction was "the exact one in the png", so the only operation applied
// to any surviving pixel is a translation. No filter, no key, no threshold, no
// vector trace — every RGBA value inside the crop is byte-identical to the
// source. What is removed is empty canvas, and nothing else.
//
// WHY A CROP IS NEEDED AT ALL. The supplied export is 800x533 but the artwork
// only occupies rows 107-405, columns 21-786. The rest is transparent padding,
// and an <img> box is sized by the FILE, not by the ink inside it: shipped
// uncropped, 44% of the header's logo slot would be empty space and the mark
// would render 44% smaller than the space it was given.
//
// THE THRESHOLD IS ALPHA >= 16, AND THAT NUMBER IS MEASURED, NOT GUESSED.
// The export carries a whisper-faint halo — alpha 1-15 — spreading nearly to
// the canvas edge. Trimming on "alpha > 0" honours that halo and returns
// 774x503 (aspect 1.54), which is the padding problem all over again. At >= 16
// the box is 766x299 (aspect 2.56) and stable: >= 64, >= 128 and >= 200 all
// return within three pixels of it, so the crop is not sitting on a cliff.
// Everything below 16 is invisible on any surface and is what gets cut.
//
// PADDING of 3px is added back on every side. It keeps the anti-aliased outer
// edge of the gold bevel from touching the file boundary, where a browser
// scaling the bitmap down would sample against nothing and hairline the rim.
//
// OUTPUT IS WEBP, AND THE SOURCE IS A RASTER — THIS CANNOT BE MADE A VECTOR.
// The lockup is a photoreal 3D render: gradient-mesh bevels on the gold, a
// specular sweep across every letter, a soft drop shadow. There is no vector
// data in it to recover. An auto-trace produces thousands of flat polygons that
// approximate the gradients and visibly changes the artwork — which is the one
// thing this pass was told not to do. `public/synergy-logo_3.svg` in this repo
// is exactly that mistake already made once: 391 KB of traced polygons standing
// in for a bitmap. Format follows the artwork.
// =============================================================================
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SRC =
  process.argv[2] ?? "C:/Users/Mohamed samy/Downloads/LATEST SYNERGY.PNG";
// 🔴 NOT public/. This is the MASTER, and it is imported by
// components/LogoLockup.tsx so next/image can derive right-sized AVIF/WebP from
// it. Anything in public/ is served verbatim at full weight; a static import is
// not, so the browser only ever receives the optimised derivative (~5 KB at the
// sizes this mark actually renders) and never the 280 KB original.
const OUT_PNG = join(root, "assets/synergy-lockup-2026.png");

const ALPHA_FLOOR = 16; // see the docblock — measured, not guessed
const PAD = 3;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: C } = info;

let minX = W;
let minY = H;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * C + 3] < ALPHA_FLOOR) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

if (maxX < 0) {
  console.error("FAIL — no pixel reached the alpha floor. Wrong file?");
  process.exit(1);
}

const left = Math.max(0, minX - PAD);
const top = Math.max(0, minY - PAD);
const width = Math.min(W - left, maxX - minX + 1 + PAD * 2);
const height = Math.min(H - top, maxY - minY + 1 + PAD * 2);

console.log(`source   ${W}x${H}`);
console.log(`ink      ${minX},${minY} -> ${maxX},${maxY}`);
console.log(
  `crop     ${left},${top} ${width}x${height}  (aspect ${(width / height).toFixed(3)})`,
);

// PNG, LOSSLESS, AND NO WEBP SIBLING — the encode is next/image's job.
//
// Measured on this artwork, compositing each candidate over the real surfaces
// and comparing against the lossless control (which returns PSNR ∞, so the
// harness is sound):
//
//   webp lossless   172.1 KB   PSNR ∞
//   webp q95         85.7 KB   PSNR 32.9   <- lossy WebP MANGLES this mark
//   avif q95        103.0 KB   PSNR 48.1
//
// WebP's chroma handling wrecks the saturated gold-on-blue at any quality worth
// shipping. Rather than hand-pick a format here, the master stays lossless and
// next/image emits AVIF (already first in next.config.mjs's `formats`) at the
// handful of sizes the mark actually renders.
await sharp(SRC)
  .ensureAlpha()
  .extract({ left, top, width, height })
  .png({ compressionLevel: 9 })
  .toFile(OUT_PNG);

const { statSync } = await import("node:fs");
console.log(`master   ${(statSync(OUT_PNG).size / 1024).toFixed(1)} KB  ${OUT_PNG}`);
