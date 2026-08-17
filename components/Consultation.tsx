"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useParallax } from "./useParallax";

/**
 * Consultation — rebuilt on reyou.life's `.cta-primary_wrap` block, measured
 * live at 1536×710 and re-measured at 1280 / 1200 / 1120 / 1050 / 1040 / 1025 /
 * 768 / 390. Their anatomy, our tokens. No CSS of theirs is copied and none of
 * their files are used.
 *
 * WHAT THEIRS DOES, MEASURED:
 *
 *   section      full-bleed 1536×764, min-height 100svh, overflow hidden;
 *                spacers 112px top and bottom, both OVER the photograph
 *   container    1472 (viewport − 64), 12 cols × 93.325 with 32px gaps
 *   panel        `span 6` of 12 = 720px = 46.9% of viewport, left-anchored,
 *                aspect-ratio 4/3, radius 8, padding 64
 *   surface      #F8F4EE at α0.05 + backdrop-filter blur(12px)
 *   edge         NO border. A 16px cream outer glow at 0.10 plus four separate
 *                1px inset cream hairlines at 0.65
 *   anchoring    flex column + justify-content:space-between + gap 64.
 *                Two children only: a top block and the h2.
 *   the big gap  122.71px at 1536 — NOT authored. It is the space-between
 *                remainder inside a fixed 4:3 box (540 − 128 − 224 − 65.29).
 *                Proved by shrinking the viewport: at 1280 the panel is
 *                shorter and the gap collapses to exactly 61.77, the declared
 *                gap value, with zero free space. So the air is a consequence
 *                of the aspect ratio, and ours reproduces it the same way —
 *                by holding 4/3 and letting space-between do the work, not by
 *                hard-coding a distance.
 *   CTA          text link, no fill: label 15px UPPERCASE tracking −0.243px,
 *                gap 8, row height 32; icon a 32px circle, 0.8px border,
 *                border-radius round, overflow hidden, 24-viewBox arrow
 *   headline     Kufam 400, 34/40.8 (lh 1.2), tracking −0.0162em, cap-trimmed
 *                (65.29px box for two lines), max-width 84.9% of content
 *   responsive   fully fluid; exactly two discontinuities — the panel flips
 *                from span 6 to span 12 between 1025 and 1040 (bisected), and
 *                padding halves at the same boundary (56.2 → 29.3); a
 *                container query at <46em drops aspect-ratio to auto
 *
 * OUR PROPORTIONS:
 *   panel width  `lg:w-[calc(50%-16px)]`. Their span-6 of a 12-col/32-gap grid
 *                resolves algebraically to exactly C/2 − g/2, so this is their
 *                column maths, not an eyeballed half. At 1440 it gives 672px
 *                = 46.7% of viewport against their measured 46.9%.
 *   breakpoint   ours flips at Tailwind `lg` (1024) against their 1025–1040
 *                band — within a pixel of the same place, and it is our token.
 *   aspect       4/3 from `md` up, auto below. Theirs drops at 736px, which
 *                sits between our sm and md; md (768) keeps 4/3 at 768 (as
 *                theirs does) and auto at 390 (as theirs does).
 *   type         their fluid ramps re-derived from the measurements rather
 *                than copied — paragraph 14.7px + 0.383vw clamped 16–20
 *                (theirs: 16.2@390, 17.6@768, 19.3@1200, 20@1536); headline
 *                15.3px + 1.36vw clamped 21–34 (theirs: 20.6@390, 25.8@768,
 *                32.7@1280, 34@1536).
 *   cap-trim     `.cap-trim .cap-display` is our existing utility, derived
 *                from our own Kufam metrics; it lands within 0.05px of their
 *                shipped trim at the same size, which is what confirmed the
 *                mechanism was read correctly in the first place.
 *
 * THE ONE DELIBERATE DEVIATION — the tint.
 * Theirs is CREAM at α0.05, which lightens. That cannot carry text over our
 * photography; the same finding is already recorded for `.hiw-glass`, where
 * cream-α0.05 measured 0.99–1.28:1. Ours is NAVY, alpha solved against the
 * real composite across the parallax travel. See `.consult-glass` in
 * globals.css for the derivation. Composition, geometry, blur, radius and the
 * five-part edge are matched exactly; only the hue of the tint changes.
 *
 * NO BRAND MARK. Theirs pairs the paragraph with a 128px face mark. We have no
 * equivalent, and the signature is not one — so the slot is simply absent
 * rather than filled with something borrowed.
 *
 * NO COLOUR GRADE on the photograph. The alpha above was solved against the
 * ungraded pixels; adding a filter afterwards would invalidate it.
 *
 * PARALLAX: the shared hook at the Testimonials pairing (`top-[-15%] h-[130%]`
 * with ±10), not the deeper Coverage one. Both are shipped configs. The deep
 * pairing leaves a safe band of only the middle 30.5% of the source frame —
 * every human-subject photograph tested cropped a head at one extreme or both.
 * The shallow pairing widens that band to 56.9%, which is what lets this
 * section have people in it. Cover slack is 0.040 Hs at each extreme, checked.
 */
export default function Consultation() {
  const t = useTranslations("consultation");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useParallax(sectionRef, bgRef, { from: -10, to: 10, reduce });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="consult-heading"
      // bg-navy is the under-colour, not a surface: it shows only in the frame
      // or two before the photograph paints, and matches its darkest corner so
      // there is no flash. The section owns overflow-hidden because the
      // parallax box is 130% of its height.
      className="relative overflow-hidden bg-navy py-16 md:py-20 lg:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
        >
          <Image
            src="/synergy/consultation-family-walk.jpg"
            alt=""
            fill
            /* Measured at 375: the box is 375x525 (0.71:1) against a 1.50:1
               source, so `object-cover` renders the image 788 CSS px wide and
               `100vw` asked for 375 — w=750 enlarged 2.1x and 52% of the frame
               was cropped. 200vw is the honest figure. See components/Hero.tsx
               for why the box width is the wrong thing to declare here. */
            sizes="(max-width: 640px) 200vw, (max-width: 1024px) 120vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* max-w matches every other section on this page. Theirs has no cap, so
          above a ~1684px viewport our panel stops growing where theirs would
          keep going — the only place the two diverge on width. */}
      <div className="relative mx-auto max-w-[1620px] px-5 md:px-8">
        <div className="consult-glass flex flex-col justify-between gap-8 rounded-[8px] p-6 md:aspect-[4/3] md:gap-10 md:p-8 lg:w-[calc(50%-16px)] lg:gap-16 lg:p-16">
          {/* TOP BLOCK — paragraph, then the CTA under it, exactly as theirs */}
          <div>
            <p className="max-w-none text-[clamp(16px,0.92rem+0.383vw,20px)] leading-[1.45] text-cream lg:max-w-[24rem]">
              {t("paragraph")}
            </p>

            {/* A real link, not a button: it navigates. The visible label IS
                the accessible name, so it announces its destination, and the
                arrow is decorative and hidden from the tree. */}
            <Link
              href={`/${locale}/calculator`}
              className="consult-cta mt-8 inline-flex h-8 items-center gap-2 text-[14px] uppercase tracking-[-0.016em] text-cream transition-colors duration-200 hover:text-gold-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-pale md:mt-10 md:text-[15px] lg:mt-16"
            >
              {t("ctaLabel")}
              <span
                aria-hidden="true"
                className="consult-arrow grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-current"
              >
                {/* Two copies: the first leaves right on hover while the
                    second arrives from the left, both clipped by the circle —
                    the same gesture theirs makes with JS. */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>

          {/* BOTTOM — the display line, pinned by space-between */}
          <h2
            id="consult-heading"
            className="cap-trim cap-display max-w-[85%] font-display text-[clamp(21px,0.96rem+1.36vw,34px)] font-normal leading-[1.2] tracking-[-0.016em] text-cream"
          >
            {t("headline")}
          </h2>
        </div>
      </div>
    </section>
  );
}
