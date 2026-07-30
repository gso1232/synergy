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
      // Same slim gutter on all four sides now, top included — the header
      // floats over the photo rather than sitting in a band above it, so there
      // is no cream tail to optically compensate for any more.
      style={{ padding: "var(--hero-gutter)" }}
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
          quality={82}
          // The card is the viewport minus two slim gutters at every width.
          // With a 6805px source every derivative Next picks (up to 3840) is a
          // genuine downscale, so the browser never has to enlarge.
          sizes="98.5vw"
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
              className="text-[clamp(28px,3.6vw,52px)] font-semibold leading-[1.06] tracking-[-0.03em] text-white"
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
                  number so the destination is unambiguous. */}
              <CtaPair
                locale={locale}
                variant="photo"
                quoteLabel={tCta("quote")}
                callLabel={tCta("call")}
                callAria={tCta("callAria")}
                phoneHref={tNav("phoneHref")}
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
