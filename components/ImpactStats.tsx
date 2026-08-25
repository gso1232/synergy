"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

/**
 * The three-figure impact band, directly under the hero — the reference's
 * arrangement at familyfirstlife.com, rebuilt in this site's colours.
 *
 * =============================================================================
 * MEASURED OFF THE REFERENCE AT 1440, not approximated:
 *
 *   outer cards   white, 427 x 396, 60px padding, square, no shadow
 *   middle card   427 x 460 — TALLER, which is the whole visual idea: it
 *                 breaks the band's top and bottom edge instead of sitting
 *                 inside it
 *   figure        34px / 800 / lh 44.2
 *   unit          12px / 700 / +0.4px tracking, uppercase
 *   label         20px / 700
 *   position      immediately after the hero, ~140px below its bottom edge
 *
 * The reference's middle card is its brand red #ED1C24. Here it is `navy-soft`
 * #22496F — the site's single accent, already carrying the Join CTA, the utility
 * strip's badges and the hero's two buttons. Cream on it measures 8.16:1.
 *
 * =============================================================================
 * 🔴 THE CARDS RISE ON SCROLL, STAGGERED, AND THE MIDDLE ONE LEADS. The
 * reference fades its three in on entry; this does the same with the centre
 * card first, because it is the one that breaks the band and reads as the
 * subject. `whileInView` + `once: true` so it plays when the band is reached
 * and never replays on the way back up.
 *
 * ⚠️ REDUCED MOTION IS NOT A SHORTER ANIMATION, IT IS NO ANIMATION. When the
 * preference is set the variants collapse to a plain opacity swap with zero
 * travel — matching how FadeUp and the hero already behave in this codebase,
 * rather than inventing a third convention.
 */

type Stat = {
  /** The figure itself, e.g. "$15". */
  value: string;
  /** The scale word under it, e.g. "Billion +". Empty for a plain count. */
  unit: string;
  label: string;
  /** The centre card, which is filled and taller. */
  feature?: boolean;
};

export default function ImpactStats() {
  const t = useTranslations("impact");
  const reduce = useReducedMotion();

  const stats: Stat[] = [
    { value: t("s1v"), unit: t("s1u"), label: t("s1l") },
    { value: t("s2v"), unit: t("s2u"), label: t("s2l"), feature: true },
    { value: t("s3v"), unit: t("s3u"), label: t("s3l") },
  ];

  const group = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

  const card = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <section aria-labelledby="impact-heading" className="font-hero bg-cream">
      <h2 id="impact-heading" className="sr-only">
        {t("s1l")} · {t("s2l")} · {t("s3l")}
      </h2>

      {/* 🔴 `items-center` IS WHAT LETS THE MIDDLE CARD BREAK THE BAND. The
          reference's centre card is 64px taller than its neighbours and
          overhangs them equally top and bottom; centring the row rather than
          stretching it reproduces that without absolute positioning, and it
          degrades to three equal stacked cards on a phone for free. */}
      <motion.ul
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto flex max-w-[1320px] list-none flex-col items-stretch px-5 py-14 sm:px-8 md:flex-row md:items-center md:gap-0 md:py-20"
      >
        {stats.map((s) => (
          <motion.li
            key={s.label}
            variants={card}
            className={`flex flex-1 flex-col items-center justify-center px-8 text-center ${
              s.feature
                ? "z-10 bg-navy-soft py-16 text-cream md:py-[74px]"
                : "bg-white py-12 text-ink md:py-14"
            }`}
          >
            <p
              className={`text-[clamp(28px,3.2vw,34px)] font-extrabold leading-[1.3] ${
                s.feature ? "text-cream" : "text-ink"
              }`}
            >
              {s.value}
            </p>

            {/* The unit is optional: "Families Helped" is a plain count and has
                no scale word, so rendering an empty line would leave a 16px gap
                under that one figure and knock the three labels out of line. */}
            {s.unit ? (
              <p
                className={`mt-1 text-[12px] font-bold uppercase leading-[1.3] tracking-[0.4px] ${
                  s.feature ? "text-cream/80" : "text-ink/75"
                }`}
              >
                {s.unit}
              </p>
            ) : null}

            <p
              className={`mt-4 text-[clamp(17px,1.6vw,20px)] font-bold leading-[1.3] ${
                s.feature ? "text-cream" : "text-ink"
              }`}
            >
              {s.label}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
