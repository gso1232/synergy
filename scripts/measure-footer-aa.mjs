/**
 * measure-footer-aa.mjs — per-block WCAG AA for text sitting OVER the footer
 * photograph.
 *
 * The footer has no flat surface under its type. Every glyph composites against
 * `public/footer/ground-sunrise-hills.jpg` seen through a cream gradient, so the
 * contrast under "Privacy Policy" is a different number from the contrast under
 * the logo. A single global figure would be a guess. This measures each block
 * against the pixels actually beneath it.
 *
 * HOW IT WORKS
 *   1. You give it the real geometry from the built DOM (below) — the image
 *      layer's box and every text block's rect relative to that box.
 *   2. It reproduces `object-fit: cover` + `object-position` to map each rect
 *      onto source pixels.
 *   3. It composites the cream gradient at each patch's own row, taking the
 *      LOWEST alpha the patch spans (least cream = most photograph = worst).
 *   4. It reports the WORST 8px patch per block. 8px because a 14-15px glyph
 *      has a ~2px stem and a patch that size sits under one; a bright or dark
 *      speck smaller than a stem cannot break a letter, one this size can.
 *
 * USAGE
 *   Run the snippet in HOW TO REGENERATE THE INPUT (bottom of this file) in the
 *   browser against the built page, save the result as JSON, then:
 *
 *     node scripts/measure-footer-aa.mjs < footer-geometry.json
 *
 * RE-RUN AFTER ANY CHANGE TO: the gradient stops, the vertical padding, the
 * object-position, or the image file. All four move the answer.
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";

/** Override to trial a replacement before committing to it:
 *    FOOTER_IMAGE=/path/to/candidate.jpg node scripts/measure-footer-aa.mjs < geom.json */
const IMAGE = process.env.FOOTER_IMAGE ?? "public/footer/ground-sunrise-hills.jpg";

/** The cream wash. MUST match the two gradients in components/Footer.tsx. */
/** The page gradient's BOTTOM stop — the surface the footer actually opens on.
 *  Was [248,244,238] when the page was flat cream. MUST track the end stop of
 *  the body gradient in globals.css and the two stops in Footer.tsx. */
const CREAM = [244, 239, 228];
/** Held alpha of the bottom-anchored scrim across the content region. */
const SCRIM = 0.55;

const INK = [26, 26, 26];
const PATCH = 8;
const AA_NORMAL = 4.5;
/** WCAG "large text": >=24px, or >=18.66px bold. */
const isLarge = (fs, fw) => fs >= 24 || (fs >= 18.66 && Number(fw) >= 700);

const lin = (v) => {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/**
 * Combined alpha at `y` px down a layer of height `h`.
 *
 * Both gradients are anchored in PIXELS to an edge, not to a percentage of the
 * layer, so this takes --melt and --reveal in px rather than stop fractions.
 * They stack as two independent cream layers, so the resulting alpha is the
 * standard 1 - (1-a)(1-b) rather than the sum.
 */
function alphaAt(y, h, melt, reveal) {
  const aMelt = melt <= 0 ? 0 : Math.max(0, 1 - y / melt);
  const fromBottom = h - y;
  const aScrim = reveal <= 0 ? SCRIM : SCRIM * Math.min(1, fromBottom / reveal);
  return 1 - (1 - aMelt) * (1 - aScrim);
}

const over = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

const geom = JSON.parse(readFileSync(0, "utf8"));
const { layer, blocks } = geom;

const src = sharp(IMAGE);
const meta = await src.metadata();
const { data, info } = await src.removeAlpha().raw().toBuffer({ resolveWithObject: true });

// object-fit: cover — scale so the source covers the box, then offset by
// object-position across whichever axis overflows.
const scale = Math.max(layer.w / meta.width, layer.h / meta.height);
const [posX, posY] = (geom.objectPosition ?? "50% 38%")
  .split(/\s+/)
  .map((p) => parseFloat(p) / 100);
const overflowX = meta.width * scale - layer.w;
const overflowY = meta.height * scale - layer.h;
const originX = (posX * overflowX) / scale;
const originY = (posY * overflowY) / scale;

const px = (sx, sy) => {
  const x = Math.min(meta.width - 1, Math.max(0, Math.round(sx)));
  const y = Math.min(meta.height - 1, Math.max(0, Math.round(sy)));
  const i = (y * info.width + x) * 3;
  return [data[i], data[i + 1], data[i + 2]];
};

const rows = [];
for (const b of blocks) {
  const need = isLarge(parseFloat(b.fs), b.fw) ? 3.0 : AA_NORMAL;
  let worst = null;
  const step = Math.max(2, PATCH / 2);
  for (let y = b.y; y < b.y + b.h; y += step) {
    for (let x = b.x; x < b.x + b.w; x += step) {
      const h = Math.min(PATCH, b.y + b.h - y), w = Math.min(PATCH, b.x + b.w - x);
      if (h < 2 || w < 2) continue;
      // least cream anywhere in the patch = worst case for this patch. Both
      // gradients weaken downward across the content region, so that is the
      // patch's bottom row.
      const a = alphaAt(Math.min(layer.h, y + h), layer.h, geom.melt, geom.reveal);
      let r = 0, g = 0, bl = 0, n = 0;
      for (let yy = y; yy < y + h; yy += 2) {
        for (let xx = x; xx < x + w; xx += 2) {
          const [pr, pg, pb] = px(originX + xx / scale, originY + yy / scale);
          r += pr; g += pg; bl += pb; n++;
        }
      }
      const composited = over(CREAM, a, [r / n, g / n, bl / n]);
      const ratio = contrast(INK, composited);
      if (!worst || ratio < worst.ratio) {
        worst = { ratio, a, composited, y: Math.round(y) };
      }
    }
  }
  rows.push({
    name: b.name,
    fs: b.fs,
    alpha: worst.a,
    hex: "#" + worst.composited.map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""),
    ratio: worst.ratio,
    need,
    pass: worst.ratio >= need,
  });
}

rows.sort((a, b) => a.ratio - b.ratio);
const pad = Math.max(...rows.map((r) => r.name.length));
console.log(`image ${meta.width}x${meta.height} -> layer ${layer.w}x${layer.h}  scale ${scale.toFixed(4)}  object-position ${geom.objectPosition}  --melt ${geom.melt}px  --reveal ${geom.reveal}px`);
console.log(`ink #1A1A1A over the worst ${PATCH}px patch in each block\n`);
for (const r of rows) {
  console.log(
    r.name.padEnd(pad),
    ("a=" + r.alpha.toFixed(3)).padEnd(9),
    r.hex.padEnd(9),
    (r.ratio.toFixed(2) + ":1").padStart(8),
    ("needs " + r.need.toFixed(1)).padEnd(11),
    r.pass ? "PASS" : "*** FAIL ***",
  );
}
const fails = rows.filter((r) => !r.pass);
console.log(`\n${rows.length - fails.length}/${rows.length} pass. tightest ${rows[0].ratio.toFixed(2)}:1 (${rows[0].name}).`);
if (fails.length) process.exitCode = 1;

/* HOW TO REGENERATE THE INPUT — run against the built page, save as JSON:

(() => {
  const f = document.querySelector('footer');
  const layer = f.querySelector('div[aria-hidden]');
  const L = layer.getBoundingClientRect();
  const rel = r => ({ x:+(r.x-L.x).toFixed(1), y:+(r.y-L.y).toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1) });
  const blocks = [];
  const push = (name, el) => { if (!el) return;
    const rg = document.createRange(); rg.selectNodeContents(el);
    const r = rg.getBoundingClientRect(); if (!r.height || !r.width) return;
    const cs = getComputedStyle(el);
    blocks.push({ name, ...rel(r), fs: cs.fontSize, fw: cs.fontWeight }); };
  push('logo wordmark (svg)', f.querySelector('a[aria-label] svg'));
  const ps = [...f.querySelectorAll('p')];
  push('brand tagline', ps.find(p => p.className.includes('font-display')));
  push('mission blurb', ps.find(p => p.className.includes('max-w-[40ch]')));
  f.querySelectorAll('h3').forEach(h => push('heading: ' + h.innerText, h));
  f.querySelectorAll('nav li a').forEach(a => push('nav link: ' + a.innerText, a));
  f.querySelectorAll('address li').forEach(li => push('contact: ' + li.innerText.slice(0,22), li.querySelector('a') || li));
  f.querySelectorAll('div.lg\\:col-start-11 li').forEach(li => push('legal: ' + li.innerText, li));
  const bar = ps.slice(-2);
  push('copyright', bar[0]); push('sign-off', bar[1]);
  // --melt / --reveal are unregistered custom properties, so getComputedStyle
  // returns the raw clamp() expression, not px. Read the RESOLVED lengths out
  // of the painted gradient instead — that is what actually composites anyway.
  const bg = getComputedStyle(layer.lastElementChild).backgroundImage;
  const px = [...bg.matchAll(/([\d.]+)px/g)].map(m => parseFloat(m[1]));
  return JSON.stringify({ layer: { w:+L.width.toFixed(1), h:+L.height.toFixed(1) },
    melt: px[1], reveal: px[3],
    objectPosition: getComputedStyle(layer.querySelector('img')).objectPosition, blocks }, null, 2);
})()

*/
