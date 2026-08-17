"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import CtaPair from "./CtaPair";

// Kept for the one-edit revert back to the clip — see the MEDIA block below.
// const HERO_VIDEO = "/hero-video.mp4";

/**
 * public/hero-porch-family.jpg — THE SAME PHOTOGRAPH the client placed in
 * public/, re-sourced at full original resolution.
 *
 *   Multi-generation family on the white porch steps of a house, greenery
 *   either side. By Jelly Marketing, on Pexels.
 *   https://www.pexels.com/photo/multigenerational-family-on-porch-steps-38674354/
 *   Pexels License — "Free to use." / "No attribution required."
 *   Commercial and non-commercial use. Not a Pexels+ paid asset.
 *
 *   Native 6805×4537 (3:2), 5.44 MB, 30.87 MP.
 *
 * The client's own copy (public/image-1785087312955.jpg) is the identical frame
 * at 1100×733 / 0.81 MP — a preview, not a master. At the card's 1404 CSS px it
 * needed a 1.95× upscale at 1× DPR and 3.89× at 2×, which is why it looked
 * soft; no `sizes`, `quality` or derivative change can add detail that is not
 * in the file. That copy is left in place but is no longer referenced.
 *
 * Imported statically rather than by path string: that is what lets Next derive
 * the intrinsic size and generate the `blurDataURL` from the real file at build
 * time, instead of us hand-pasting a base64 blob that nothing verifies.
 */
import heroPhoto from "../public/hero-porch-family.jpg";

/**
 * Hero — a rounded card floating on the cream page.
 *
 * The card is inset by `--hero-gutter` on all four sides (left, right, bottom,
 * and top measured from the bottom edge of the fixed header) and clipped to
 * `--hero-radius`. Both are continuous clamp() ramps, so the inset and the
 * corner grow with the viewport instead of stepping at breakpoints — see the
 * block at the top of globals.css for the resolved values.
 *
 * Height is `100svh` minus the header minus both gutters, capped at 880px.
 * svh, not vh: on mobile `vh` is pinned to the *largest* viewport, so the card
 * would be taller than the visible area while the URL bar is showing and the
 * layout would jump the moment it collapsed.
 *
 * `.hero-card` carries overflow:hidden + translateZ(0). The translateZ is not
 * cosmetic — Safari drops the rounded clip on composited/transformed children
 * without its own layer, and the media punches square corners through the
 * radius. CHECK THIS IN SAFARI.
 *
 * The navbar that used to float in here is gone; the site header is a real
 * global component mounted in the layout.
 *
 * The copy block is unchanged from the version that was signed off — same
 * order (headline, subhead, buttons, ITIN tagline), same sizes, same bottom-left
 * anchor, same per-word `whitespace-nowrap` wrapper that stopped the trailing
 * "s." from orphaning onto its own row. The only difference is that its padding
 * is now measured from the card edge rather than the viewport edge.
 */
export default function Hero() {
  const t = useTranslations("hero");
  // The phone number lives in `nav` and is already the footer's tel: href.
  // Read from there rather than duplicating a phone number into a second key
  // that could drift out of sync with it.
  const tNav = useTranslations("nav");
  const tCta = useTranslations("cta");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const lines = [t("headlineA"), t("headlineB")];

  const group: Variants = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.018, delayChildren: 0.15 } },
      };

  const char: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: "0.45em" },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const fadeIn: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        show: (d: number = 0) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
        }),
      };

  return (
    <section
      aria-labelledby="hero-heading"
      className="font-hero"
      // 🔴 THE TOP GUTTER CARRIES THE HEADER AGAIN. It was "same slim gutter on
      // all four sides now, top included — the header floats over the photo
      // rather than sitting in a band above it", which was true while the bar
      // was transparent. It is opaque cream from 2026-08-16, so an equal top
      // gutter put the card's top 106px (and both top corners) behind it.
      // `.hero-card`'s height subtracts the same variable, so the card still
      // ends exactly one gutter above the fold rather than overflowing it.
      style={{
        padding: "var(--hero-gutter)",
        paddingTop: "calc(var(--header-h-rest) + var(--hero-gutter))",
      }}
    >
      <div className="hero-card bg-navy">
        {/* MEDIA.
            REVERT TO VIDEO: delete the <Image> below, uncomment this block and
            the HERO_VIDEO const at the top of the file. Nothing else changes —
            the card, the gradient and the copy are media-agnostic.

            <video
              data-hero-video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_VIDEO}
              autoPlay={!reduce}
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
        */}
        <Image
          src={heroPhoto}
          alt={t("imageAlt")}
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          /* 🔴 82 -> 65, AND IT MAKES THE DESKTOP FASTER AS WELL AS THE PHONE
             SHARPER. Correcting `sizes` below moved the phone from w=750 to
             w=2048, and at q82 that is a 500KB LCP image — unshippable on the
             one connection least able to afford it. Measured on this build,
             AVIF, same source:

               w=750  q82    81KB    34% of 1:1   <- the reported blur
               w=1200 q82   192KB    54%
               w=1920 q82   447KB    87%          <- what desktop pays today
               w=2048 q82   500KB    93%
               w=1920 q65   239KB    87%
               w=2048 q65   266KB    93%          <- phone now
               w=2048 q55   174KB    93%

             THE TABLE SAYS RESOLUTION BEATS QUALITY, and that is the whole
             argument: w=2048 q55 is 174KB at 93% of 1:1, CHEAPER than w=1200
             q82 at 192KB and 54%. Spending the byte budget on pixels rather
             than on precision is strictly the better buy when the image is
             being enlarged, because compression artefacts at this resolution
             land below one device pixel while an enlargement does not.

             65 rather than 55 because `quality` is one value for every
             breakpoint, and the desktop shows this photograph at roughly 1:1
             where q55 AVIF starts to show banding in the sky. At 65 the phone
             takes 266KB for a genuinely sharp hero (from 81KB and blurred) and
             the desktop DROPS from 447KB to 239KB for the same 87%. */
          quality={65}
          // 🔴 THE OLD NOTE HERE WAS WRONG, AND IT IS WORTH SAYING WHY. It read:
          // "the card is the viewport minus two slim gutters at every width.
          // With a 6805px source every derivative Next picks (up to 3840) is a
          // genuine downscale, so the browser never has to enlarge." The first
          // sentence is true and the conclusion does not follow from it.
          //
          // `sizes` describes the BOX. Under `object-cover` the rendered IMAGE
          // is not the box: in a portrait box the image is scaled until its
          // HEIGHT fills, so it renders `boxHeight x sourceAR` wide and hangs
          // off both sides. Measured on a 375px phone: the card is 363x736, so
          // the image renders 1104 CSS px wide (736 x 1.50) — but `98.5vw` asked
          // for 363, the browser fetched w=750, and at DPR 2 it enlarged that
          // 3.0x to fill 2208 device px. "A genuine downscale of the source" and
          // "an enlargement on screen" are both true at once; only the second
          // one is visible, and it is the reported blur.
          //
          // The three values are the real requirement at the three shapes the
          // card takes. Phone (box AR 0.49): 736 x 1.50 = 1104 CSS px = 294vw,
          // rounded to 270vw so DPR 2 lands on w=2048 rather than overshooting
          // to 3840 — 92% of 1:1, which is not a visible softness. Tablet
          // (0.84): the honest figure is 175vw, held to 130vw for the same
          // reason, since an LCP image is the one place bytes are least
          // affordable. Desktop is unchanged: from about 1.50:1 up the box is
          // WIDER than the cover-scaled image, so the box governs again and
          // 98.5vw was correct there all along.
          sizes="(max-width: 640px) 270vw, (max-width: 1024px) 130vw, 98.5vw"
          // Subject is centred, copy sits bottom-left.
          //   X 47.5% — the family group spans 0.330–0.635 of the frame width
          //   (centre 0.4825). On a phone the card is ~0.45 aspect, so
          //   object-cover keeps only ~30.3% of the source width; 47.5% centres
          //   that window on the group at 0.331–0.634, so nobody is cropped at
          //   either edge. 50% would shave the standing man's shoulder.
          //   Y 35% — wide/short cards crop vertically instead (~5% on desktop).
          //   Biasing above centre keeps the porch roof and the hanging
          //   baskets, and spends the crop on the foreground steps and grass,
          //   which the copy block covers anyway. It also lifts the seated
          //   grandmother clear of the headline's top line.
          className="object-cover [object-position:47.5%_35%]"
        />

        {/* Legibility gradients. Both live INSIDE the card so the radius clips
            them and no straight edge shows at the corners.
              bottom → top : carries the headline / sub / CTAs / ITIN tag
              top → bottom : carries the transparent-state navbar
            The top one is part of the image treatment, not a navbar surface —
            the bar itself stays a pure overlay with no background of its own. */}
        <div aria-hidden="true" className="hero-veil-top absolute inset-x-0 top-0 h-[38%]" />
        <div aria-hidden="true" className="hero-veil absolute inset-0" />

        {/* COPY — bottom-left, padding measured from the card edge. */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:px-12 md:pb-14 lg:px-16">
          <div className="max-w-[42rem]">
            <motion.h1
              id="hero-heading"
              variants={group}
              initial="hidden"
              animate="show"
              aria-label={`${lines[0]} ${lines[1]}`}
              /* 🔴 THE HEADLINE LEAVES THE HERO'S OWN FACE. Everything else in
                 this section stays on Inter via `font-hero` on the <section> —
                 the sub-copy, the CTAs, the ITIN line — because they are UI and
                 Inter is the right tool for them. The headline is not UI, it is
                 the first impression, and it was the last place on the site
                 still setting a tight grotesque under a serif logo.

                 FOUR VALUES CHANGED, ALL IN THE SAME DIRECTION (2026-08-16,
                 brief: "more relaxed more aesthetically pleasing"):
                   font        font-hero (Inter) -> font-display (Fraunces)
                   weight      600 semibold      -> 500 medium
                   tracking    -0.03em           -> -0.005em
                   leading     1.06              -> 1.1
                 -0.03em is a correction grotesques need at display size and
                 serifs actively fight; keeping it would have jammed Fraunces's
                 serifs into each other at the clamp ceiling. 600 + tight
                 tracking + 1.06 leading is a headline that is SHOUTING, which
                 is the opposite of the instruction.

                 ⚠️ THE `pb-[0.14em] -mb-[0.14em]` PAIR ON THE LINE SPANS BELOW
                 STILL COVERS THIS. It exists so `overflow-hidden` masks the
                 character rise without clipping descenders (the "g" in
                 Protecting / Building). Checked against the new face rather
                 than assumed: Fraunces's descent is 0.2209 against Inter's
                 0.2256, i.e. marginally SHALLOWER, so the existing 0.14em
                 allowance has more room than it did, not less. */
              className="font-display text-[clamp(28px,3.6vw,52px)] font-medium leading-[1.1] tracking-[-0.005em] text-white"
            >
              {lines.map((line, li) => (
                // pb/-mb pair: overflow-hidden masks the character rise without
                // clipping descenders (the "g" in Protecting / Building).
                <span
                  key={li}
                  className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"
                >
                  {line.split(" ").map((word, wi, words) => (
                    // Words are atomic. Previously every glyph was its own
                    // inline-block, so the browser could break mid-word — it
                    // orphaned "s." onto its own row and it read as a stray dot.
                    <span key={wi} className="inline-block whitespace-nowrap">
                      {Array.from(word).map((c, ci) => (
                        <motion.span
                          key={`${li}-${wi}-${ci}`}
                          variants={char}
                          aria-hidden="true"
                          className="inline-block"
                        >
                          {c}
                        </motion.span>
                      ))}
                      {wi < words.length - 1 && (
                        <motion.span
                          variants={char}
                          aria-hidden="true"
                          className="inline-block"
                        >
                          &nbsp;
                        </motion.span>
                      )}
                    </span>
                  ))}
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="show"
              custom={0.55}
              className="mt-4 max-w-[46ch] text-[clamp(14px,1.05vw,15px)] leading-[1.55] text-white"
            >
              {t("sub")}
            </motion.p>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              custom={0.72}
              className="mt-5 flex flex-wrap gap-2.5"
            >
              {/* THE SITE'S CTA PAIR — see components/CtaPair.tsx.
                  ---------------------------------------------------------
                  HISTORY. This hero shipped two `href="#"` stubs, then a
                  single "Talk to an advisor" dialling `nav.phoneHref` (the
                  quote button was pulled because /contact did not exist yet
                  and the lead modal is disabled).

                  BOTH OF THOSE FACTS HAVE CHANGED. /contact is built, so the
                  quote CTA has an honest destination again and `hero.ctaQuote`
                  comes back — now read from the shared `cta` namespace so the
                  hero cannot drift from the other pairs.

                  🔴 "Talk to an advisor" IS RETIRED SITE-WIDE. It rendered
                  twice under one label pointing at two different destinations
                  (tel: here, /contact in WhatWeCover) — ambiguous in the copy
                  and inconsistent in the code. `hero.ctaCall` is retained
                  untouched in both message files, simply unrendered. The
                  phone survives as the SECONDARY, labelled with the literal
                  number so the destination is unambiguous.

                  🔴 AND THE HERO'S SECONDARY IS NO LONGER THE PHONE. It is
                  "Join our team" -> /join. The hero now addresses both of
                  Synergy's audiences in one pair: the primary is for someone
                  who wants cover, the secondary for someone who wants to sell
                  it — which is what /join exists for and what WhoWeServe
                  already splits the page into further down.

                  THE PHONE IS NOT LOST. It remains the secondary on the other
                  three pairs (WhatWeCover, /about §4, /services §4), it is the
                  first row of the footer's Contact column as a real tel:, and
                  it is in the header. `cta.call` and `cta.callAria` are
                  untouched and still rendered — just not here. */}
              <CtaPair
                locale={locale}
                variant="photo"
                quoteLabel={tCta("quote")}
                secondary={{ kind: "route", label: tCta("join"), route: "join" }}
              />
            </motion.div>

            {/* ITIN tagline — last item in the same left stack */}
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="show"
              custom={0.88}
              className="mt-5 text-[13px] font-medium tracking-[0.01em] text-white"
            >
              {t("tagline")}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
