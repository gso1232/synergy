"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { routeHref } from "@/routes";
import FadeUp from "./FadeUp";
import RevealText from "./RevealText";
import CtaPair from "./CtaPair";
import { useParallax } from "./useParallax";

// Three products (Final Expense dropped): Term (protect now), IUL (grow),
// Tax-Free Retirement (the only card carrying the ITIN "No SSN required" line).
/* 🔴 FIVE NOW, NOT THREE — Health and Medicare added on instruction 2026-08-25.
   The grid below moves from `md:grid-cols-3` to a 2/3 split so five items do not
   leave a lone card stranded in a half-empty final row: two up top, three
   beneath at desktop. */
const CARDS = ["term", "iul", "taxfree", "health", "medicare"] as const;

export default function WhatWeCover() {
  const t = useTranslations("whatWeCover");
  const tCta = useTranslations("cta");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Scroll-driven parallax: the background travels at a different rate than the
  // content as the section passes through the viewport. The implementation now
  // lives in useParallax and is shared with Testimonials — same tween, same
  // ±16 / scrub:true, so the two sections cannot drift apart. Disabled entirely
  // under reduced motion; the background then sits static.
  useParallax(sectionRef, bgRef, { reduce });

  /**
   * THE CARD ENTRANCE — OPTION 4, approved 2026-08-03, chosen from four
   * candidates rendered on this section's own copy in a `_reveal-lab` demo
   * route (since deleted).
   *
   * translateY 24 -> 0 AND scale 0.97 -> 1, 900ms,
   * cubic-bezier(0.77, 0, 0.175, 1), 100ms per card.
   *
   * 🔴 NO OPACITY CHANNEL, AND THAT IS THE WHOLE CHANGE. The previous version
   * faded `opacity: 0 -> 1` over 850ms. These cards carry white and gold-pale
   * type on a translucent panel over a photograph, and a group fade drags the
   * TEXT and its BACKING toward the page colour together — measured on the
   * demo's equivalent pair, gold-deep on cream fell to 1.40:1 at alpha 0.25 and
   * 2.05:1 at alpha 0.50, recovering to 5.16:1 only at full opacity. Transform
   * only means the card is at full contrast on its first painted frame.
   *
   * ⚠️ `reduce` IS DELIBERATELY NOT CONSULTED HERE ANY MORE. Reduced motion is
   * enforced by the `[data-reveal]` rule in globals.css, which is resolved
   * before hydration; a JS branch resolves after first paint and was measured
   * stranding cards at their hidden state. `reduce` is still read above for
   * useParallax, which is a scrub and genuinely needs the JS value.
   *
   * The easing matches `useMaskReveal`'s so the box and the words inside it
   * read as one gesture; 900ms is shorter than the 1200ms text reveal so the
   * card settles before its own copy finishes arriving.
   */
  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const rise: Variants = {
    hidden: { y: 24, scale: 0.97 },
    show: {
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cover-heading"
      // `cover-scene` is a focus-ring hook, not a style: it scopes the
      // photographic two-tone ring in globals.css to the controls that sit on
      // this section's full-bleed photograph (the two intro CTAs), the same
      // way `.cover-card` scopes it to the tiles. A flat ring can't clear 3:1
      // on the cleared middle third of `.cover-veil`. See the note there.
      className="cover-scene relative overflow-hidden bg-navy"
    >
      {/* Full-bleed parallax photograph */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {/* 🔴 `cover-photo-layer` REBUILDS THIS LAYER BELOW 1024px. The desktop
            geometry here — `top-[-30%] h-[160%]`, sized to absorb the ±16
            yPercent parallax travel — is UNCHANGED and still the only thing
            this element does at lg and up. See the media query in globals.css.

            WHY IT HAD TO CHANGE. The section is 2824px tall on a 375px phone
            (three stacked cards at min-h-360 plus the heading block), so the
            160% layer resolved to 375x4518 — a 0.083:1 box holding a 1.50:1
            photograph. `object-cover` fits by HEIGHT there, so it kept 9% of
            the frame and enlarged what was left 11.3x. That is the blurred
            green smear behind the cards; the file is a real 2400x1602 capture
            and was never the problem.

            `sizes` COULD NOT HAVE SAVED IT. Under object-cover the rendered
            image width is `boxHeight x sourceAR` = 4518 x 1.5 = 6777 CSS px,
            which is past next/image's 3840 ceiling — no derivative exists that
            would have been sharp in this box. The geometry is the fix, and the
            `sizes` below is then simply the truth about the new geometry:
            under 630px the band is floored at 420px tall so the photo renders
            630px wide; above that the band is 66.67vw tall, so it renders
            exactly 100vw. Both are now reachable derivatives.

            🔴 THE FIRST FIGURE IS 600px, NOT THE 630px THE GEOMETRY ASKS FOR,
            AND THE 5% IS DELIBERATE. next/image's deviceSizes step
            ...1080, 1200, 1920..., and the browser takes the first candidate at
            or above `sizes x DPR`. 630 x 2 = 1260 clears 1200 and jumps to
            w=1920 — 1.5x more pixels than the band can show. 600 x 2 = 1200
            lands exactly on that derivative and renders at 95% of 1:1, which
            is not a visible softness on a photograph and is a large byte saving
            on the one connection that cannot afford it. DPR 3 resolves to 1920
            either way, so nothing is lost there. */}
        <div
          ref={bgRef}
          className="cover-photo-layer absolute inset-x-0 top-[-30%] h-[160%] will-change-transform"
        >
          <Image
            src="/synergy/coverage-family-meadow.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 630px) 600px, 100vw"
            className="cover-photo object-cover object-[center_40%]"
          />
        </div>
        <div className="cover-veil absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-6 py-16 md:px-8 lg:py-20">
        {/* Heading block — deliberately small so the cards below lead */}
        <FadeUp className="mx-auto max-w-[44ch] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            {t("eyebrow")}
          </p>
          {/* The section heading reveals word-by-word under a mask. It keeps
              its `id` because `aria-labelledby="cover-heading"` on the section
              points at it — the split is visual only and leaves textContent
              intact, so the accessible name is unchanged. */}
          <RevealText
            as="h2"
            id="cover-heading"
            text={t("heading")}
            className="mt-2.5 font-display font-semibold text-[clamp(25px,2.6vw,34px)] leading-[1.06] tracking-[-0.02em] text-white"
          />
          <p className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-[1.55] text-white">
            {t("subhead")}
          </p>
          {/* THE SHARED CTA PAIR — see components/CtaPair.tsx. Was a
              hand-rolled pair: `ctaPrimary` ("Get a free quote") -> /contact
              and `ctaSecondary` ("Talk to an advisor") -> /contact. Two
              buttons, one destination: the secondary was a second door to the
              same page, which is exactly what the pair is meant not to be.
              🔴 "Talk to an advisor" is retired site-wide (it also rendered in
              the hero pointing somewhere else). `whatWeCover.ctaPrimary` and
              `ctaSecondary` are retained untouched in both message files and
              are simply no longer rendered; the labels now come from the
              shared `cta` namespace. */}
          <CtaPair
            locale={locale}
            variant="photo"
            quoteLabel={tCta("quote")}
            secondary={{
              kind: "tel",
              label: tCta("call"),
              aria: tCta("callAria"),
              href: tNav("phoneHref"),
            }}
            className="mt-7 justify-center"
          />
        </FadeUp>

        {/* Three translucent cards */}
        <motion.div
          variants={group}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
          className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CARDS.map((key) => (
            <motion.a
              key={key}
              // href="#" — REPLACED. The three cards are Term Life, IUL and
              // Tax-Free Retirement and their CTA reads "Learn more". All
              // three subjects are on /services (seven products plus the
              // comparison table), so one honest destination serves the set.
              // 🟡 A per-card deep link would be better — /blog carries built
              // articles for term-life-insurance and indexed-universal-life-iul
              // — but there is NO built article for "Tax-Free Retirement"
              // (`nurses-tax-free-retirement` is a listing row with no body),
              // so two cards would deep-link and one would not. Uniform beats
              // two-thirds. Revisit when that article is written.
              href={routeHref(locale, "services")}
              variants={rise}
              // `data-reveal` is the hook for the reduced-motion rule in
              // globals.css. Removing it silently breaks reduced motion here.
              data-reveal
              className="cover-card group flex min-h-[360px] flex-col rounded-[4px] p-10 backdrop-blur-[12px] transition-[transform,box-shadow,background-color] duration-300 ease-out-expo hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                {t(`cards.${key}.eyebrow`)}
              </p>
              <h3 className="mt-3 font-display font-semibold text-[31px] leading-[1.08] tracking-[-0.015em] text-white">
                {t(`cards.${key}.name`)}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-white">
                {t(`cards.${key}.desc`)}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[12px] font-semibold uppercase tracking-[0.09em] text-white">
                {t("cta")}
                <span
                  aria-hidden="true"
                  className="text-gold transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                >
                  →
                </span>
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* Closing statement — the one large line, per the reference */}
        <FadeUp className="mx-auto mt-8 max-w-[24ch] text-center">
          <p className="font-display font-semibold text-[clamp(32px,4vw,52px)] leading-[1.06] tracking-[-0.02em] text-white">
            {t("closingLine")}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
