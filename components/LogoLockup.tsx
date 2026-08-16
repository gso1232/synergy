import Image from "next/image";
import lockup from "@/assets/synergy-lockup-2026.png";

/**
 * The client's lockup — supplied 2026-08-16 as `LATEST SYNERGY.PNG` and adopted
 * the same day. ONE component so the five placements cannot drift.
 *
 * ---------------------------------------------------------------------------
 * 🔴 THE ARTWORK IS THE SUPPLIED FILE, UNMODIFIED. The instruction was "the
 * exact one in the png ... without changing any thing of it", and the only
 * operation applied to any surviving pixel is a TRANSLATION — the transparent
 * canvas around the mark is cropped away and nothing else. No key, no
 * threshold, no recolour, no trace. `scripts/build-logo-2026.mjs` is that crop,
 * re-runnable against a fresh export, and it records why the alpha floor is 16.
 *
 * WHY IT IS NOT AN SVG, THOUGH AN SVG WAS ASKED FOR. The supplied file is a
 * photoreal 3D render: gradient-mesh bevels on the gold, a specular sweep
 * across every letter, a soft drop shadow. There is no vector data in it to
 * recover, so "convert to SVG" can only mean AUTO-TRACE — thousands of flat
 * polygons approximating those gradients, which visibly changes the artwork.
 * That is the one thing this pass was told not to do, so format follows the
 * artwork and it ships as a raster. This repo already contains that mistake
 * made once: `public/synergy-logo_3.svg` is 391 KB of traced polygons standing
 * in for the same bitmap. An SVG WRAPPER around the raster is available if a
 * file with that extension is ever required for a third party — it is the same
 * bitmap plus base64's 33% inflation, and it would be strictly worse here.
 *
 * ---------------------------------------------------------------------------
 * 🔴 IT IS A LIGHT-SURFACE MARK. THIS IS THE OPPOSITE OF THE FILE IT REPLACES,
 * AND IT IS WHY THE HEADER NOW CARRIES A SURFACE AT REST.
 *
 * Measured off the supplied pixels, against the two surfaces this site uses:
 *
 *   "INSURANCE GROUP"  #000850  on cream #F8F4EE   16.66:1
 *   "INSURANCE GROUP"  #000850  on navy  #0D1B2A    1.05:1   <- invisible
 *
 * The old lockup failed on the opposite surface: its subline was gold, which
 * sang on navy and died on cream. So this is not a regression to route around,
 * it is a straight inversion of which background the mark needs.
 *
 * 1.05:1 is not "low contrast", it is the same colour. Dropped onto the
 * transparent-over-photo header the site used to run, the subline would simply
 * not be there. THE FIX IS THE SURFACE, NOT THE FILE: the header is now solid
 * cream from the top of the page rather than a bare overlay on the hero
 * photograph, per the instruction "i want it the website without a background
 * picture". Nothing about the artwork changed to achieve this.
 *
 * THE OTHER FOUR PLACEMENTS WERE MEASURED ON THE RUNNING PAGE RATHER THAN
 * ASSUMED, and all four were already light. The docblock this one replaces
 * described the footer and the login panel as navy — that was true of an
 * earlier layout and is not true now:
 *
 *   header      cream #F8F4EE                              16.66:1
 *   login panel cream #F8F4EE (NOT the navy panel of old)  16.66:1
 *   footer      the sunrise photograph, sampled through
 *               the logo's own footprint: rgb(233,202,156)
 *               mean, 0.5844 darkest                       11.03:1 worst case
 *   mobile pane cream
 *
 * So no placement needed a plate in the end. The footer is the one to re-check
 * if that photograph is ever swapped — it passes because the image is a light
 * sunrise, not because anything is defending it.
 *
 * ⚠️ DO NOT PUT THIS COMPONENT ON A DARK SURFACE WITHOUT LOOKING AT IT. If a
 * dark one is ever needed, give it a cream plate — do not recolour the file.
 *
 * None of this is a WCAG failure either way: 1.4.3 exempts "text that is part
 * of a logo or brand name" and 1.4.11 exempts logotypes. These are legibility
 * numbers, not conformance ones.
 *
 * ---------------------------------------------------------------------------
 * RESOLUTION AND WEIGHT. The master is 772x305 (2.531:1) and lives in
 * `assets/`, NOT `public/` — deliberately. A file in public/ is served
 * verbatim at its full 280 KB; a static import is handed to next/image, which
 * emits AVIF at the handful of sizes this mark actually renders. The largest is
 * the header at rest, 58.7px tall = ~149px wide, so 3x DPR wants ~447px and the
 * master has 772 to give. Nothing is upscaled anywhere.
 *
 * FORMAT IS FORCED BY MEASUREMENT, not preference. Each candidate was
 * composited over the real surfaces and compared against a lossless control
 * (which returns PSNR ∞, so the harness is sound):
 *
 *   webp lossless   172.1 KB   PSNR ∞
 *   webp q95         85.7 KB   PSNR 32.9   <- WebP mangles the gold-on-blue
 *   avif q95        103.0 KB   PSNR 48.1
 *
 * Hence AVIF, which `next.config.mjs` already lists first in `images.formats`.
 *
 * SIZING LADDER. The header is the reference. Everything else is scaled DOWN or
 * held level with it, never past it.
 *
 *   header at rest    58.7px  (h-11 x the bar's own scale(1.3333))  <- LARGEST
 *   header scrolled   44px    h-11 / card:h-12
 *   login panel       56px    h-14
 *   footer            48px    h-12
 *   mobile panel      36px    h-9
 *   admin bar         28px    h-7 / sm:h-8
 *
 * 🔴 THE SUBLINE IS BELOW READING SIZE AT ALL OF THEM. "INSURANCE GROUP" is
 * 27px in a 305px canvas, so at 48px tall it renders 4.2px. It is texture, not
 * type. That is tolerable ONLY because every placement is wrapped in something
 * that carries the company name for assistive tech — a link with `aria-label`,
 * or an adjacent heading — which is why `alt` is empty here by default rather
 * than repeating the name.
 *
 * `alt` defaults to "" (decorative). Pass one ONLY where the lockup is the sole
 * carrier of the name and nothing around it announces the company.
 */
export default function LogoLockup({
  className = "",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={lockup}
      alt={alt}
      /* The static import carries the master's 772x305, so the box is reserved
         from the intrinsic ratio and CLS stays at 0 while the bitmap arrives.
         Height is what every placement actually sets (h-11, h-12, h-14...), so
         `sizes` is expressed against the widest of them at 3x. */
      sizes="160px"
      /* 🔴 NOT THE DEFAULT 75. This is the one image on the site where that
         default is measurably wrong: the mark is saturated gold against
         saturated blue, which is exactly the chroma case lossy codecs handle
         worst, and it renders at ~64px where artefacts land on the letterforms
         rather than in open sky. Encoding the master at q75 against a lossless
         control returned PSNR 32.9 — visible mush on the bevels. At 90 the same
         comparison clears 48. The mark is 160px wide on the wire, so the extra
         quality costs single-digit kilobytes. */
      quality={90}
      /* NEVER lazy: every placement is either above the fold (header, login,
         admin bar) or inside a section the reader has already reached. */
      priority
      className={className}
    />
  );
}
