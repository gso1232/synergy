"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParallax } from "./useParallax";

/**
 * Testimonials — rebuilt on reyou.life's "What Patients Share", measured live at
 * a 1536 viewport, over the same scrubbed parallax background as Coverage.
 *
 *   container  100% - 64px, no cap — same as Why Synergy and Where to Start
 *   grid       12 cols, 32px gutter
 *   rhythm     heading row -> 64px -> cards        (theirs exactly)
 *
 *   THEIR HEADER is three items on one row: eyebrow (cols 1-2), heading
 *   (cols 3-7) and a note (cols 10-12, "*individual experiences vary").
 *   Ours runs the heading alone. Both other slots are deliberately empty:
 *   fflsynergy publishes exactly one testimonial-related string — the section
 *   title — so there is nothing to source an eyebrow from, and the disclaimer
 *   is coming from the client rather than being written here or adapted from
 *   reyou's. The row closes up rather than being padded with invented copy.
 *
 *   THEIR CARD, kept exactly:
 *     slide      438x296, padding 0 8px  ->  16px between cards
 *     card       422x296, radius 4, padding 32, flex-column, GAP 64
 *     surface    rgba(37,37,37,0.5) + backdrop-filter: blur(12px)
 *     order      ATTRIBUTION FIRST (Overpass 20/29), 64px, then the QUOTE
 *                (Kufam 26/33.8, ls -0.0162em). No quote-mark pseudo-element —
 *                the curly quotes are characters in the copy.
 *
 *   THE SLIDER IS DROPPED. They run 15 slides in a Swiper carousel with
 *   pagination; fflsynergy publishes three testimonials. A three-item carousel
 *   is a control that barely moves, so the cards render as a static row on the
 *   same 4-of-12 grid Where to Start uses. Card anatomy is untouched.
 *
 *   MOTION: the parallax is the only animation, which is true of their section
 *   too — no card entry tween, and no hover (dispatching pointerover /
 *   pointerenter / mouseover / mouseenter / mousemove on their slide and card
 *   changed no computed property).
 *
 * COPY IS QUOTED, NOT WRITTEN. All three testimonials are reproduced verbatim
 * from fflsynergy.com's "What Our Clients Say", and the Spanish is the client's
 * own published translation, not ours. Two fragments overlap
 * checkmatefinancialgroup.com ("They made it simple," in Mark's quote; "every
 * option" in Brian & Jessica's) and are shipped unchanged: the rewrite rule
 * covers copy we author, never a quotation attributed to a named person.
 * Rewording someone's testimonial to dodge a phrase collision is the exact
 * falsification the rule exists to prevent.
 */
const QUOTES = ["q1", "q2", "q3"] as const;

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Same hook, same scrub — but ±10 rather than Coverage's ±16, and paired with
  // a 130% wrapper instead of 160%. This is a deliberate, measured reduction.
  //
  // The window this section shows is the section height inside a wrapper that
  // is taller than it, and the window SLIDES as you scroll. The band of the
  // photograph visible at EVERY scroll position — the only band where a face is
  // guaranteed never to be bisected by the section edge — is the intersection
  // of the extremes:
  //
  //   wrapper 160% / travel 16%  ->  safe band 34.8%-65.3%   (30.5% of height)
  //   wrapper 140% / travel 12%  ->  safe band 26.3%-73.7%   (47.4%)
  //   wrapper 130% / travel 10%  ->  safe band 21.5%-78.5%   (56.9%)  <- shipped
  //   wrapper 120% / travel  7%  ->  safe band 15.3%-84.7%   (69.3%)
  //
  // At 160/16 that band is so narrow that essentially all family photography
  // fails it — people sit in the upper third of a sofa shot, and the previous
  // two backgrounds were decapitated at one end of the travel or the other.
  // 130/10 opens the band to 56.9% and puts this photograph's faces (26%-48%)
  // inside it with ~4.5 points of margin at the top. Background still travels
  // 26% of the section height, so it reads clearly as parallax.
  useParallax(sectionRef, bgRef, { from: -10, to: 10, reduce });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-navy"
    >
      {/* Full-bleed parallax photograph. The travelling layer is 130% of the
          section starting 15% high, so ±10% of travel still never exposes an
          edge (top reaches -2% at worst, bottom +102%). Coverage keeps 160/16;
          see the note on useParallax above for why this one is shallower. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-x-0 top-[-15%] h-[130%] will-change-transform"
        >
          <Image
            src="/synergy/testimonials-family-sofa.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={70}
            // object-center, and the vertical half of that is a no-op BY
            // CONSTRUCTION: the wrapper is always taller in aspect than the 3:2
            // photograph at every width (1280 -> 1280x763, 390 -> 390x1405), so
            // cover fits by HEIGHT and crops width. Nothing vertical is left to
            // position — the full frame height always maps to the wrapper. That
            // is exactly why the safe-band arithmetic above governs whether a
            // face survives, and object-position cannot rescue it.
            // Horizontally 50% is a real choice: on phone only ~19% of the
            // width shows, and centre lands on the father-and-son look, which
            // is the emotional centre of the frame.
            className="ts-photo object-cover object-center"
          />
        </div>
        <div className="ts-veil absolute inset-0" />
      </div>

      <div className="relative z-10 px-5 py-14 md:px-8 lg:py-20">
        <div className="mx-auto">
          {/* HEADER ROW — reyou's three parts on one line: eyebrow cols 1-2,
              heading cols 3-7, disclaimer cols 10-12 hard right. items-center
              plus cap-trim puts all three cap bands on one centre line, the
              same mechanism as Where to Start. */}
          <div className="md:grid md:grid-cols-12 md:items-center md:gap-x-8">
            <div className="flex md:col-span-2">
              <p className="flex h-full items-center gap-2 text-[11px] font-semibold uppercase leading-none tracking-[0.16em] text-cream">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-cream"
                />
                <span className="cap-trim cap-body">{t("eyebrow")}</span>
              </p>
            </div>

            <div className="mt-6 md:col-span-5 md:col-start-3 md:mt-0">
              <h2
                id="testimonials-heading"
                className="cap-trim cap-display font-display font-medium text-[clamp(20px,2.35vw,34px)] leading-[1.2] tracking-[-0.0162em] text-cream"
              >
                {t("headline")}
              </h2>
            </div>

            {/* DISCLAIMER — cols 10-12, right-aligned, exactly where reyou put
                theirs. The STRING IS A PLACEHOLDER and must not ship: this is a
                legal results-disclaimer on a US insurance site, so the wording
                comes from the client, not from here and not from reyou's.
                Hand the final line over as  testimonials.disclaimer  in
                messages/en.json, with its mirror in es.json. */}
            <div className="mt-4 md:col-span-3 md:col-start-10 md:mt-0">
              <p className="cap-trim cap-body text-[15px] leading-[1.45] tracking-[0.016em] text-cream/85 md:text-right">
                {t("disclaimer")}
              </p>
            </div>
          </div>

          {/* THE THREE QUOTES — a real <ul>: three peer testimonials with no
              inherent order, so a list is the honest structure and <blockquote>
              carries the quotation semantics. */}
          <ul className="xl:grid xl:grid-cols-12 xl:gap-x-8">
            {QUOTES.map((q, i) => (
              <li
                key={q}
                className={[
                  // Cards pulled in so the photograph reads AROUND them rather
                  // than through them. The 12-col relationship is untouched —
                  // each still occupies its 4-col track at xl — but px-4 insets
                  // the card inside that track, so the visible gutter between
                  // cards goes 32 -> 64 and the outer edges gain 16 each. At md
                  // the centred stack drops from 8 of 12 columns to 6, which is
                  // where most of the extra photograph comes from on tablet.
                  "mt-10 px-4 md:mx-auto md:mt-16 md:w-[calc((100%_-_352px)_/_2_+_160px)] md:px-0 xl:mx-0 xl:mt-16 xl:w-auto xl:px-4",
                  i === 0
                    ? "xl:col-span-4 xl:col-start-1"
                    : i === 1
                      ? "xl:col-span-4 xl:col-start-5"
                      : "xl:col-span-4 xl:col-start-9",
                ].join(" ")}
              >
                {/* padding 24, not reyou's 32 — the cards are smaller now, and
                    32 inside a narrower card left the quote squeezed. The 64px
                    gap between attribution and quote is theirs, unchanged. */}
                <figure className="ts-card flex h-full flex-col gap-16 rounded-[4px] p-6">
                  {/* Attribution first, then the quote — their order, which
                      reads as a person speaking rather than a pull-quote with a
                      credit tacked on. figcaption is the accessible home for
                      the attribution regardless of visual position. */}
                  <figcaption className="text-[clamp(16px,1.3vw,20px)] leading-[1.45] text-cream">
                    {t(`quotes.${q}.name`)}
                  </figcaption>
                  <blockquote className="font-display font-normal text-[clamp(18px,1.7vw,26px)] leading-[1.3] tracking-[-0.0162em] text-cream">
                    {t(`quotes.${q}.quote`)}
                  </blockquote>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
