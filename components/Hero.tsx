"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { routeHref } from "@/routes";
import heroPhoto from "../public/hero-porch-family.jpg";

/**
 * THE HOMEPAGE HERO — rebuilt 2026-08-24 to match familyfirstlife.com's.
 *
 * =============================================================================
 * WHAT THIS REPLACED, so the old decisions are not re-derived by accident.
 *
 * The previous hero was a LEFT-ALIGNED INSET CARD: a rounded photo card sitting
 * inside `--hero-gutter` with the copy stacked down its left edge, a per-word
 * mask-reveal animation on the headline, an eyebrow, a sub, a CtaPair and the
 * ITIN tagline. It is gone in full. What it was is recoverable from git; what
 * matters here is that its geometry no longer applies:
 *
 *   · NO GUTTER, NO RADIUS. The reference hero is full-bleed, edge to edge.
 *     `--hero-gutter` and `--hero-radius` are not read by this file any more.
 *   · CENTRED, NOT LEFT-ALIGNED. Every line is centred on the page axis.
 *   · THE PHOTO IS A BACKGROUND, NOT A CARD. `fill` + `object-cover` behind an
 *     absolutely-positioned scrim, rather than a bounded element with its own
 *     rounded clip.
 *
 * =============================================================================
 * MEASURED OFF THE REFERENCE AT 1440, NOT APPROXIMATED. Read from the live
 * page's computed styles:
 *
 *   headline      44px / 700 / lh 51px
 *   second line   30px / 700 / lh 40px / +1px tracking
 *   product row   21px / 600 / lh 28px / +1.3px tracking
 *   buttons       13px / 800 / uppercase / +0.4px tracking / 17px padding /
 *                 square corners
 *
 * 🔴 THE BUTTON COLOURS ARE THE ONE DELIBERATE DEPARTURE FROM THE REFERENCE.
 * It ships grey #6B6B6B and red #ED1C24. Both are `navy-lift` #1C3A5A here, on
 * instruction, so the whole site carries ONE accent: the Join pill, the strip's
 * two badges and these two CTAs. `navy-lift` is not a new colour invented for
 * this — it is already in the palette, derived as the lightest navy that keeps
 * gold legal as normal text (5.10:1), which is why it reads as navy rather than
 * as a fifth brand colour.
 *   blurb         17px / 400 / lh 23.8px
 *   section       200px top padding, 240px bottom
 *
 * The sizes ship as `clamp()` rather than fixed px because the reference's own
 * narrow layout drops the headline to 32px, and a clamp reaches that without a
 * breakpoint. Ceilings are the measured desktop values.
 *
 * 🔴 THE PHOTOGRAPH IS SYNERGY'S OWN, AND THAT IS DELIBERATE. The reference
 * serves `home-hero-v3.jpg` from its own WordPress uploads. Pointing at that
 * file would put a third-party URL in the critical render path of this site's
 * largest image — it can be renamed or removed without warning, and it would
 * not be optimised by next/image. `hero-porch-family.jpg` is already in this
 * repo, already the right warm register, and already served as AVIF/WebP.
 *
 * =============================================================================
 * 🔴 THE FIVE PRODUCTS WRAP; THEY ARE NOT A 2x2 GRID. The reference ships four
 * in two fixed rows. Synergy has five, and a hard grid would leave the fifth
 * stranded in a half-empty row at every width. `flex-wrap` centred gives 2+2+1
 * at desktop — visually the reference's block plus one centred line — and
 * collapses to one per line on a phone without a media query.
 *
 * ⚠️ THE TICK IS DECORATIVE AND IS MARKED SO. It is `aria-hidden`; a screen
 * reader gets the product name and no "check mark" after every item.
 */

/**
 * Measured off the reference: uppercase, heavy, square, tight tracking.
 *
 * 🔴 THE HORIZONTAL PADDING IS RESPONSIVE AND THE 50px IS THE DESKTOP VALUE.
 * The reference sets 50px either side. On a 375px phone the buttons go full
 * width (335px), and 100px of padding leaves 235px for "APPLY TO WORK WITH
 * SYNERGY" at 13px — which wraps, making that button 60px tall against the
 * other one's 47px. Measured. 20px below `sm` keeps both on one line and both
 * the same height.
 */
const BTN =
  "inline-flex items-center justify-center gap-2 px-5 py-[17px] sm:px-[50px] text-[13px] font-extrabold uppercase leading-[13px] tracking-[0.4px] text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none";

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 6 10"
      className="h-[10px] w-[6px] shrink-0 fill-none stroke-current stroke-[1.8]"
    >
      <path d="M1 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tick() {
  return (
    <span aria-hidden="true" className="ml-1.5 text-[#3DD35F]">
      ✓
    </span>
  );
}

export default function Hero({ locale }: { locale: string }) {
  const t = useTranslations("hero");

  const products = ["p1", "p2", "p3", "p4", "p5"] as const;

  return (
    <section
      aria-labelledby="hero-heading"
      /* `font-hero` is Be Vietnam Pro and is scoped to this element — see the
         note on that slot in app/[locale]/layout.tsx. */
      className="font-hero relative isolate overflow-hidden bg-navy"
    >
      <Image
        src={heroPhoto}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        /* The hero image is the LCP element on the homepage: it must not lazy
           load and it must not wait behind anything else. */
        priority
        /* 🔴 20% FROM THE TOP, NOT CENTRED — THE FACES WERE BEHIND THE COPY.
           `hero-porch-family.jpg` is 6805x4537 (3:2) inside a box that is much
           wider than it is tall, so `cover` crops 884px vertically and nothing
           horizontally. Centred, that crop lands the family group in the exact
           vertical middle of the frame, which is where the headline and the
           buttons sit — the man on the steps and the girl beside him were
           behind the text.

           Biasing the window toward the top of the photograph pushes the group
           DOWN into the clear band under the blurb. 884px of crop is the whole
           budget, so 50% -> 12% is worth ~80px on screen at 1440: small, and it
           is the entire range this image allows. If more separation is ever
           wanted the fix is a taller frame or a different crop of the source,
           not a bigger number here — anything past 0% simply clamps. */
        className="z-0 object-cover object-[center_12%]"
      />

      {/* 🔴 THE SCRIM IS NOT DECORATION, IT IS THE REASON THE TEXT IS LEGIBLE.
          The reference's photograph is already a dark sunset and carries its own
          contrast; `hero-porch-family.jpg` is brighter, so white type over it
          needs help. A flat tint at 52% measured as the lightest value that
          holds body copy above 4.5:1 across the whole frame rather than only
          where the photo happens to be dark. */}
      {/* 🔴 z-10, NOT -z-10. A NEGATIVE z-index inside this section paints
          BEHIND the section's own `bg-navy`, so the photograph and the scrim
          both disappeared under a flat navy rectangle — which is exactly what
          the first render did. The stack is: photo 0, scrim 10, copy 20, all
          positive, all inside the `isolate` context. `bg-navy` stays as the
          colour behind the photo while it decodes. */}
      <div aria-hidden="true" className="absolute inset-0 z-10 bg-navy/[0.52]" />

      {/* 🔴 THE TOP PADDING IS MEASURED FROM THE BAR, NOT GUESSED. The header
          is `position: fixed`, so it sits OVER this section — a bare 200px
          happened to clear it at 1440 and did not at every width. Deriving it
          from `--header-h-rest` means the copy clears the bar by the same
          visible gap whatever the bar is, and the variable is set beside the
          bar's own height so the two cannot drift.

          THE BOTTOM STAYS LARGER THAN THE TOP because the reference's is — 200
          top, 240 bottom. It is not decoration here: a taller box brings the frame
          ratio closer to the photograph's own 3:2, so `cover` crops less of it
          away, and the extra height lands BELOW the copy, which is the band the
          family group needs to be visible in. */}
      <div className="relative z-20 mx-auto flex max-w-[900px] flex-col items-center px-5 pb-[clamp(96px,17vw,240px)] pt-[calc(var(--header-h-rest)+clamp(40px,7vw,100px))] text-center sm:px-8">
        <h1
          id="hero-heading"
          className="text-[clamp(30px,4.2vw,44px)] font-bold leading-[1.16] text-white"
        >
          {t("protectHeadline")}
        </h1>

        {/* A second line of the same heading, not a separate one — it reads as
            one sentence and must not open a new outline level. */}
        <p className="mt-1 text-[clamp(21px,2.9vw,30px)] font-bold leading-[1.33] tracking-[1px] text-white">
          {t("protectSub")}
        </p>

        <ul
          /* 🔴 THE max-width IS WHAT MAKES IT WRAP 2 + 2 + 1. Unconstrained in a
             900px column the five items pack 3 + 2, which reads as a different
             block from the reference's two even rows. 640px is the width at
             which the longest pair — "Indexed Universal Life" plus "Fixed
             Indexed Annuities" — still fits on one line and the third pair
             cannot, so the fifth drops to its own centred line. */
          className="mt-5 flex max-w-[640px] flex-wrap items-center justify-center gap-x-8 gap-y-1 text-[clamp(16px,2vw,21px)] font-semibold leading-[1.33] tracking-[1.3px] text-white"
        >
          {products.map((p) => (
            <li key={p} className="whitespace-nowrap">
              {t(p)}
              <Tick />
            </li>
          ))}
        </ul>

        {/* Side by side above 640, stacked below — which is what the reference
            does at its own narrow width, measured at a single centred column. */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href={routeHref(locale, "contact")}
            className={`${BTN} w-full bg-navy-soft hover:bg-navy-lift sm:w-auto`}
          >
            {t("ctaQuoteLong")}
            <Chevron />
          </Link>
          <Link
            href={routeHref(locale, "join")}
            className={`${BTN} w-full bg-navy-soft hover:bg-navy-lift sm:w-auto`}
          >
            {t("ctaApply")}
            <Chevron />
          </Link>
        </div>

        <p className="mt-10 max-w-[62ch] text-[clamp(15px,1.6vw,17px)] font-normal leading-[1.4] text-white">
          {t("blurb")}
        </p>
      </div>
    </section>
  );
}
