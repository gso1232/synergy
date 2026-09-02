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


/**
 * 🔴 THE CARDS HAD NO ICON AT ALL UNTIL 2026-09-01, AND THE BRIEF ASKS FOR ONE.
 * "For the Services section ... White background, Navy headings, Royal blue
 * accents, Blue icons, Thin blue borders." Four of those five landed in the
 * rebrand; the icons were simply missing, and an audit of the built page found
 * it rather than a reading of the spec.
 *
 * One line weight (1.6), one 28px box, one colour (`currentColor`, set to royal
 * on the card), and no fill. That uniformity is the point: five icons drawn at
 * five different weights read as clip-art, and the brief asks for "simple and
 * modern". They are `aria-hidden` because the card already carries its name as
 * a heading, so a screen reader gains nothing and loses nothing.
 */
const CARD_ICONS: Record<(typeof CARDS)[number], JSX.Element> = {
  // Term Life — a shield, the plainest "cover for a period" mark there is.
  term: (
    <path d="M14 3.2 5 6.4v6.1c0 5.4 3.7 9.6 9 11.3 5.3-1.7 9-5.9 9-11.3V6.4l-9-3.2Z" />
  ),
  // IUL — a rising line over a floor, which is literally what an indexed
  // policy is: market-linked growth with a floor under it.
  iul: (
    <>
      <path d="M4 21h20" />
      <path d="M5.5 16.5 11 11l4 4 6.5-7.5" />
      <path d="M21.5 7.5H17m4.5 0V12" />
    </>
  ),
  // Tax-Free Retirement — a nest egg on a base.
  taxfree: (
    <>
      <path d="M14 3.6c3.4 3 5.6 6.6 5.6 10.1a5.6 5.6 0 0 1-11.2 0C8.4 10.2 10.6 6.6 14 3.6Z" />
      <path d="M6.5 24.4h15" />
    </>
  ),
  // Health — a cross inside a rounded square, the universal care mark.
  health: (
    <>
      <rect x="4" y="4" width="20" height="20" rx="5" />
      <path d="M14 9.5v9M9.5 14h9" />
    </>
  ),
  // Medicare — a person under a shield: cover that follows an individual.
  medicare: (
    <>
      <path d="M14 3.6 6 6.4v5.4c0 4.8 3.3 8.6 8 10.1 4.7-1.5 8-5.3 8-10.1V6.4l-8-2.8Z" />
      <circle cx="14" cy="11" r="2.4" />
      <path d="M9.9 18.2c.7-2 2.2-3.1 4.1-3.1s3.4 1.1 4.1 3.1" />
    </>
  ),
};

function CardIcon({ name }: { name: (typeof CARDS)[number] }) {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      focusable="false"
      className="h-7 w-7 shrink-0 fill-none stroke-current stroke-[1.6]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CARD_ICONS[name]}
    </svg>
  );
}

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
      /* 🔴 THE PHOTOGRAPH IS BACK AND THE CARDS ARE NOT, 2026-09-01.
         This section was stripped to a flat white surface earlier today so the
         tiles could become the brief's white-card-with-a-blue-hairline. That
         worked, and the photograph was then asked for again — WITHOUT reverting
         the cards. So this is the hybrid: the parallax scene and its veil are
         restored exactly as they were, and the five tiles stay white with a
         royal border.

         ⚠️ THAT SPLIT DECIDES THE TEXT COLOURS, AND IT IS NOT A STYLE CHOICE.
         Everything OUTSIDE a card sits on the photograph and must be white —
         the eyebrow, the heading, the subhead, the closing line, and CtaPair's
         `photo` variant, which paints opaque pills so contrast never depends on
         the pixels behind them. Everything INSIDE a card sits on white and must
         be navy/ink. Setting either group to the other is not a slightly worse
         look, it is unreadable.

         `cover-scene` comes back with the photo: it scopes the two-tone focus
         ring in globals.css to controls over the image, because a flat ring
         cannot clear 3:1 on the cleared middle third of `.cover-veil`. */
      className="cover-scene relative overflow-hidden bg-navy"
    >
      {/* Full-bleed parallax photograph */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {/* `cover-photo-layer` rebuilds this layer below 1024px; the desktop
            geometry here (`top-[-30%] h-[160%]`) is sized to absorb the +/-16
            yPercent parallax travel. The full derivation of the geometry and of
            the `sizes` figures is in git history for this file. */}
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

      <div className="relative z-10 mx-auto max-w-[1500px] px-[var(--gutter)] py-[var(--section-y)]">
        {/* Heading block — deliberately small so the cards below lead */}
        <FadeUp className="mx-auto max-w-[44ch] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
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
              /* 🔴 WHITE CARD, THIN ROYAL BORDER. Was `.cover-card` — a
              translucent navy fill with a 12px backdrop-blur, which only made
              sense floating on a photograph. On white the border IS the card:
              royal at 30% is a 1px hairline that reads without shouting, and
              it deepens on hover so the tile still answers the pointer. No
              fill change and no blur, per "minimal shadows and no heavy
              effects". */
              className="group flex min-h-[360px] flex-col rounded-[4px] border border-royal/30 bg-white p-[var(--card-p)] transition-[transform,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-royal motion-reduce:hover:translate-y-0"
            >
              <span className="mb-5 inline-flex text-royal">
                <CardIcon name={key} />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-royal">
                {t(`cards.${key}.eyebrow`)}
              </p>
              <h3 className="mt-3 font-display font-semibold text-[31px] leading-[1.08] tracking-[-0.015em] text-navy">
                {t(`cards.${key}.name`)}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-ink">
                {t(`cards.${key}.desc`)}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[12px] font-semibold uppercase tracking-[0.09em] text-navy">
                {t("cta")}
                <span
                  aria-hidden="true"
                  /* Royal, not gold: gold is 2.38:1 on white. */
                  className="text-royal transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
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
