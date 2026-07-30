/**
 * THE ONE PLACE THAT MAPS A CARRIER KEY TO ITS LOGO FILE.
 *
 * Extracted from CarrierStrip on 2026-07-30 when /about §2b was wired to real
 * artwork. Both surfaces — the homepage marquee (all 21) and the About grid
 * (five) — now read this map, so a renamed or replaced file is one edit and the
 * two cannot disagree about which mark belongs to which carrier.
 *
 * NAMES ARE NOT HERE. They live in `carriers.names.*` in the message files, so
 * the alt text is the same translated string the strip already renders.
 *
 * 🔴 `carriers.ratings.*` ARE ALL EMPTY STRINGS AND MUST STAY THAT WAY. An
 * "A-rated" / "AM Best" claim next to a carrier mark is a banned claim on this
 * site; the keys exist only so the slot is not re-invented later.
 */

/** The client folder "public/Insurance Carriers Logos/" has spaces, which are
 *  fragile in URLs (a pre-encoded %20 gets double-encoded by the browser). The
 *  cleared logos are copied verbatim into space-free public/carriers/ — the
 *  convention this codebase already documents — and served from there. The
 *  original folder is left untouched. */
export const LOGO_DIR = "/carriers";

/** Confirmed-appointment key → logo file in `public/carriers/`.
 *  All 21 map to a real file; none needs upscaling at the sizes either surface
 *  renders (40px in the homepage marquee, 48px in the About grid). */
export const LOGO_FILE: Record<string, string> = {
  c1: "mutual-of-omaha.svg",
  c2: "transamerica.svg",
  c3: "americo.png",
  c4: "american-amicable.png",
  c5: "north-american.png",
  c6: "global-atlantic.png",
  c7: "athene.png",
  c8: "corebridge-financial.png",
  c9: "lincoln-financial.png",
  c10: "nassau.webp",
  c11: "foresters.svg",
  c12: "liberty-bankers.png",
  // 2026-07-30 — the 9 formerly held-back carriers, now confirmed (Ziad is
  // contracted with all). One file per carrier; the 3 "-2" duplicate source
  // files are skipped. Both rasters clear the 40px row with margin (aflac.png
  // 375×122, national-life-group.png 272×120 → 3× native height); the 7 SVGs
  // are vector. Nothing is upscaled.
  c13: "aetna.svg",
  c14: "aflac.png",
  c15: "american-national.svg",
  c16: "columbus-life.svg",
  c17: "ethos.svg",
  c18: "fg.svg",
  c19: "national-life-group.png",
  c20: "royal-neighbors.svg",
  c21: "united-home-life.svg",
};

/** Full public path for a carrier key. */
export function carrierLogoSrc(key: string): string {
  return `${LOGO_DIR}/${LOGO_FILE[key]}`;
}
